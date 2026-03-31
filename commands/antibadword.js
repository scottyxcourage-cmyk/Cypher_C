const fs = require('fs');
const { checkAdmin, reply, getSender, getIsOwner, isAdmin } = require('./_helper');
const FILE = './data/antibadword.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function antibadwordCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    const gd = d[chatId] || { enabled: false, words: [] };
    if (!sub) return reply(sock, chatId, `🤬 *Anti-Badword*\nStatus: ${gd.enabled?'✅ ON':'❌ OFF'}\nWords: ${gd.words?.join(', ') || 'none'}\n\n.antibadword on\n.antibadword off\n.antibadword add <word>\n.antibadword remove <word>\n.antibadword list`, message);
    if (sub==='on')  { d[chatId]={...gd,enabled:true};  save(d); return reply(sock, chatId, '✅ Anti-badword ON!', message); }
    if (sub==='off') { d[chatId]={...gd,enabled:false}; save(d); return reply(sock, chatId, '❌ Anti-badword OFF.', message); }
    if (sub==='add' && args[1]) { if (!gd.words) gd.words=[]; gd.words.push(args[1].toLowerCase()); d[chatId]=gd; save(d); return reply(sock, chatId, `✅ Added: *${args[1]}*`, message); }
    if (sub==='remove' && args[1]) { gd.words=(gd.words||[]).filter(w=>w!==args[1].toLowerCase()); d[chatId]=gd; save(d); return reply(sock, chatId, `✅ Removed: *${args[1]}*`, message); }
    if (sub==='list') return reply(sock, chatId, `📋 Bad words:\n${gd.words?.join('\n') || 'none'}`, message);
}
async function handleBadword(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return;
    const d = get(); if (!d[chatId]?.enabled) return;
    const sender = getSender(sock, message);
    if (await isAdmin(sock, chatId, sender)) return;
    if (await getIsOwner(sock)(sender, sock, chatId)) return;
    const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').toLowerCase();
    const words = d[chatId].words || [];
    if (!words.some(w => text.includes(w))) return;
    try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
    await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]}, watch your language!\n\n_Cypher C 🎯_`, mentions: [sender] });
}
module.exports = { antibadwordCommand, handleBadword };
