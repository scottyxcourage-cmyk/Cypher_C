const fs = require('fs');
const axios = require('axios');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/chatbot.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function chatbotCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🤖 *Chatbot (AI)*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.chatbot on\n.chatbot off`, message);
    if (sub==='on')  { d[chatId]={enabled:true};  save(d); return reply(sock, chatId, '✅ AI chatbot ON!', message); }
    if (sub==='off') { d[chatId]={enabled:false}; save(d); return reply(sock, chatId, '❌ AI chatbot OFF.', message); }
}
async function handleChatbot(sock, chatId, message, text) {
    try {
        const d = get(); if (!d[chatId]?.enabled) return;
        const res = await axios.get(`https://api.simsimi.vn/v1/simsimi?text=${encodeURIComponent(text)}&lang=en`, { timeout: 10000 });
        const reply_text = res.data?.success || res.data?.message || res.data?.BotSays;
        if (reply_text) await sock.sendMessage(chatId, { text: reply_text + '\n\n_Cypher C 🎯_' }, { quoted: message });
    } catch {}
}
module.exports = { chatbotCommand, handleChatbot };
