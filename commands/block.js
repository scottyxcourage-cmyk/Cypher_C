const { reply, getIsOwner, getSender } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const target = message.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return reply(sock, chatId, '❌ Reply to a message to block someone.', message);
    try { await sock.updateBlockStatus(target, 'block'); await reply(sock, chatId, `✅ Blocked successfully.`, message); }
    catch { await reply(sock, chatId, '❌ Failed to block.', message); }
};