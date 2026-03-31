const fs = require('fs');
const { checkAdmin, reply, getSender, getIsOwner, isAdmin } = require('./_helper');
const FILE = './data/antispam.json';
const spamTrack = new Map();
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function antispamCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🚫 *Anti-Spam*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\nLimit: ${d[chatId]?.limit||5} msgs/5s\n\n.antispam on\n.antispam off\n.antispam limit <number>`, message);
    if (sub==='on')  { d[chatId]={...d[chatId],enabled:true};  save(d); return reply(sock, chatId, '✅ Anti-spam ON!', message); }
    if (sub==='off') { d[chatId]={...d[chatId],enabled:false}; save(d); return reply(sock, chatId, '❌ Anti-spam OFF.', message); }
    if (sub==='limit' && args[1] && !isNaN(args[1])) { d[chatId]={...d[chatId],limit:parseInt(args[1])}; save(d); return reply(sock, chatId, `✅ Spam limit set to ${args[1]} msgs/5s`, message); }
}
async function handleSpam(sock, chatId, message, sender) {
    if (!chatId.endsWith('@g.us')) return;
    const d = get(); if (!d[chatId]?.enabled) return;
    if (await isAdmin(sock, chatId, sender)) return;
    if (await getIsOwner(sock)(sender, sock, chatId)) return;
    const key = `${chatId}:${sender}`;
    const now = Date.now();
    const limit = d[chatId]?.limit || 5;
    if (!spamTrack.has(key)) spamTrack.set(key, []);
    const times = spamTrack.get(key).filter(t => now - t < 5000);
    times.push(now);
    spamTrack.set(key, times);
    if (times.length >= limit) {
        spamTrack.delete(key);
        try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
        await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]}, stop spamming!\n\n_Cypher C 🎯_`, mentions: [sender] });
    }
}
module.exports = { antispamCommand, handleSpam };
