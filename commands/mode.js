const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/mode.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {mode:'public'}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
function getMode() { return get(); }
async function modeCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `⚙️ *Mode*\nCurrent: *${d.mode.toUpperCase()}*\n\n.mode public — anyone can use bot\n.mode private — only owner`, message);
    if (sub==='public')  { save({mode:'public'});  return reply(sock, chatId, '✅ Mode: *PUBLIC*\nEveryone can use the bot.', message); }
    if (sub==='private') { save({mode:'private'}); return reply(sock, chatId, '🔒 Mode: *PRIVATE*\nOnly owner can use the bot.', message); }
}
module.exports = { modeCommand, getMode };
