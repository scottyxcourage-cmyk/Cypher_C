const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/bc_users.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return []; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
function addUser(jid) { const d=get(); if(!d.includes(jid)){d.push(jid);save(d);} }
async function bcCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .bc <message>', message);
    const users = get();
    if (!users.length) return reply(sock, chatId, '❌ No users in broadcast list.', message);
    await reply(sock, chatId, `📡 Broadcasting to ${users.length} users...`, message);
    let sent=0, failed=0;
    for (const u of users) {
        try { await sock.sendMessage(u, { text: `📢 *Broadcast*\n\n${text}\n\n_Cypher C 🎯_` }); sent++; await new Promise(r=>setTimeout(r,500)); } catch { failed++; }
    }
    await reply(sock, chatId, `✅ Broadcast done!\n✅ Sent: ${sent}\n❌ Failed: ${failed}`, message);
}
module.exports = { bcCommand, addUser };
