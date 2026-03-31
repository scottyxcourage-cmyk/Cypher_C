const fs = require('fs');
const { reply, getSender } = require('./_helper');
const FILE = './data/afk.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
function setAfk(userId, reason) { const d=get(); d[userId]={time:Date.now(),reason:reason||'No reason'}; save(d); }
function clearAfk(userId) { const d=get(); delete d[userId]; save(d); }
function checkAfk(userId) { return get()[userId]||null; }
async function afkCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    const reason = args.join(' ').trim() || 'No reason given';
    setAfk(sender, reason);
    await sock.sendMessage(chatId, { text: `😴 *AFK Activated*\n\n👤 @${sender.split('@')[0]}\n📝 Reason: _${reason}_\n\n_I'll notify when you're mentioned_\n\n_Cypher C 🎯_`, mentions: [sender] }, { quoted: message });
}
module.exports = { afkCommand, checkAfk, clearAfk };
