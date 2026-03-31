const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/autoreply.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false,rules:{}}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function autoReplyCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🤖 *Auto-Reply*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.autoreply on\n.autoreply off\n.autoreply set <trigger> | <response>\n.autoreply list\n.autoreply delete <trigger>`, message);
    if (sub==='on')  { d.enabled=true;  save(d); return reply(sock,chatId,'✅ Auto-reply ON!',message); }
    if (sub==='off') { d.enabled=false; save(d); return reply(sock,chatId,'❌ Auto-reply OFF.',message); }
    if (sub==='list') { const rules=Object.entries(d.rules||{}); return reply(sock,chatId,rules.length?`📋 Auto-reply rules:\n${rules.map(([k,v])=>`• ${k} → ${v}`).join('\n')}`:'No rules set.',message); }
    if (sub==='delete' && args[1]) { const key=args.slice(1).join(' ').toLowerCase(); delete d.rules[key]; save(d); return reply(sock,chatId,`✅ Deleted: ${key}`,message); }
    if (sub==='set') {
        const rest = args.slice(1).join(' '); const parts = rest.split('|').map(s=>s.trim());
        if (parts.length < 2) return reply(sock,chatId,'❌ Usage: .autoreply set <trigger> | <response>',message);
        if (!d.rules) d.rules = {}; d.rules[parts[0].toLowerCase()] = parts[1]; save(d);
        return reply(sock,chatId,`✅ Rule set!\n*Trigger:* ${parts[0]}\n*Response:* ${parts[1]}`,message);
    }
}
async function handleAutoReply(sock, message) {
    try {
        const d = get(); if (!d.enabled || !d.rules) return;
        const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').toLowerCase().trim();
        const response = d.rules[text]; if (!response) return;
        await sock.sendMessage(message.key.remoteJid, { text: response + '\n\n_Cypher C 🎯_' }, { quoted: message });
    } catch {}
}
module.exports = { autoReplyCommand, handleAutoReply };
