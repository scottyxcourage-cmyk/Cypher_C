const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/autosavestatus.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `💾 *Auto-Save Status*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.autosavestatus on\n.autosavestatus off`, message);
    if (sub==='on')  { save({enabled:true});  return reply(sock, chatId, '✅ Auto-save status ON!', message); }
    if (sub==='off') { save({enabled:false}); return reply(sock, chatId, '❌ Auto-save status OFF.', message); }
};
