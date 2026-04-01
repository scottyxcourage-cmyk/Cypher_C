const { reply, getIsOwner, getSender } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    if (args.length < 2) return reply(sock, chatId, '❌ Usage: .dm <number> <message>', message);
    const num = args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net';
    const text = args.slice(1).join(' ');
    try { await sock.sendMessage(num, { text }); await reply(sock, chatId, '✅ Message sent!', message); }
    catch { await reply(sock, chatId, '❌ Failed to send.', message); }
};