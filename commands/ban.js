const fs = require('fs');
const { reply, getSender, getIsOwner, getMentioned } = require('./_helper');
const FILE = './data/banned.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return []; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
const { extractNum } = require('../lib/isOwner');

async function banCommand(sock, chatId, message) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone to ban.', message);
    const list = get();
    for (const m of mentioned) {
        if (!list.includes(m)) list.push(m);
    }
    save(list);
    const names = mentioned.map(m=>`@${m.split('@')[0]}`).join(', ');
    await sock.sendMessage(chatId, { text: `🚫 Banned: ${names}\n\n_Cypher C 🎯_`, mentions: mentioned }, { quoted: message });
}

async function unbanCommand(sock, chatId, message) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone to unban.', message);
    let list = get();
    list = list.filter(b => !mentioned.some(m => extractNum(b) === extractNum(m)));
    save(list);
    const names = mentioned.map(m=>`@${m.split('@')[0]}`).join(', ');
    await sock.sendMessage(chatId, { text: `✅ Unbanned: ${names}\n\n_Cypher C 🎯_`, mentions: mentioned }, { quoted: message });
}

module.exports = { banCommand, unbanCommand };
