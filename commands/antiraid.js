const fs = require('fs');
const { checkAdmin, reply } = require('./_helper');
const FILE = './data/antiraid.json';
const joinTrack = new Map();
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function antiraidCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    const gd = d[chatId] || { enabled: false, limit: 5 };
    if (!sub) return reply(sock, chatId, `🛡️ *Anti-Raid*\nStatus: ${gd.enabled?'✅ ON':'❌ OFF'}\nLimit: ${gd.limit} joins/10s\n\n.antiraid on\n.antiraid off\n.antiraid limit <number>`, message);
    if (sub==='on')  { d[chatId]={...gd,enabled:true};  save(d); return reply(sock, chatId, '✅ Anti-raid ON! Group will lock if too many join at once.', message); }
    if (sub==='off') { d[chatId]={...gd,enabled:false}; save(d); return reply(sock, chatId, '❌ Anti-raid OFF.', message); }
    if (sub==='limit' && args[1] && !isNaN(args[1])) { d[chatId]={...gd,limit:parseInt(args[1])}; save(d); return reply(sock, chatId, `✅ Raid limit: ${args[1]} joins/10s`, message); }
}
async function handleRaid(sock, chatId, participants) {
    try {
        const d = get(); if (!d[chatId]?.enabled) return;
        const now = Date.now();
        const limit = d[chatId]?.limit || 5;
        if (!joinTrack.has(chatId)) joinTrack.set(chatId, []);
        const times = joinTrack.get(chatId).filter(t => now - t < 10000);
        participants.forEach(() => times.push(now));
        joinTrack.set(chatId, times);
        if (times.length >= limit) {
            joinTrack.delete(chatId);
            await sock.groupSettingUpdate(chatId, 'announcement');
            await sock.sendMessage(chatId, { text: `🚨 *Raid detected!* Group locked.\n${times.length} members joined in 10s.\n\n_Cypher C 🎯_` });
        }
    } catch {}
}
module.exports = { antiraidCommand, handleRaid };
