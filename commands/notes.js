const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/notes.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `📝 *Notes*\n\n.notes save <name> <text>\n.notes get <name>\n.notes list\n.notes delete <name>`, message);
    if (sub === 'save') {
        const name = args[1]?.toLowerCase(); const text = args.slice(2).join(' ').trim();
        if (!name || !text) return reply(sock, chatId, '❌ Usage: .notes save <name> <text>', message);
        if (!d[chatId]) d[chatId] = {};
        d[chatId][name] = text; save(d);
        return reply(sock, chatId, `✅ Note *${name}* saved!`, message);
    }
    if (sub === 'get') {
        const name = args[1]?.toLowerCase();
        if (!name) return reply(sock, chatId, '❌ Usage: .notes get <name>', message);
        const note = d[chatId]?.[name];
        return reply(sock, chatId, note ? `📝 *${name}*\n\n${note}` : `❌ Note *${name}* not found.`, message);
    }
    if (sub === 'list') {
        const keys = Object.keys(d[chatId] || {});
        return reply(sock, chatId, keys.length ? `📋 *Notes:*\n${keys.map((k,i)=>`${i+1}. ${k}`).join('\n')}` : '❌ No notes saved.', message);
    }
    if (sub === 'delete') {
        const name = args[1]?.toLowerCase();
        if (!name || !d[chatId]?.[name]) return reply(sock, chatId, `❌ Note *${name}* not found.`, message);
        delete d[chatId][name]; save(d);
        return reply(sock, chatId, `✅ Note *${name}* deleted!`, message);
    }
};
