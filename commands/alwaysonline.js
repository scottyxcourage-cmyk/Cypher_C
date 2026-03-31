const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/alwaysonline.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
let onlineInterval = null;
async function alwaysOnlineCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🟢 *Always Online*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.alwaysonline on\n.alwaysonline off`, message);
    if (sub==='on')  { save({enabled:true});  initAlwaysOnline(sock); return reply(sock, chatId, '✅ Always online ON!', message); }
    if (sub==='off') { save({enabled:false}); if (onlineInterval) { clearInterval(onlineInterval); onlineInterval=null; } return reply(sock, chatId, '❌ Always online OFF.', message); }
}
function initAlwaysOnline(sock) {
    if (onlineInterval) clearInterval(onlineInterval);
    if (!get().enabled) return;
    onlineInterval = setInterval(async () => {
        try { await sock.sendPresenceUpdate('available'); } catch {}
    }, 4 * 60 * 1000);
}
module.exports = { alwaysOnlineCommand, initAlwaysOnline };
