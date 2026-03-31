const fs = require('fs');
function extractNum(id) {
    if (!id) return '';
    return id.split(':')[0].split('@')[0];
}
function makeIsOwner(ownerPhone) {
    const ownerClean = extractNum(ownerPhone);
    return async function isOwner(senderId, sock = null, chatId = null) {
        if (!senderId) return false;
        const ownerJid    = ownerClean + '@s.whatsapp.net';
        const senderClean = extractNum(senderId);
        if (senderId === ownerJid)          return true;
        if (senderClean === ownerClean)     return true;
        if (process.env.OWNER_NUMBER) {
            const envClean = extractNum(process.env.OWNER_NUMBER);
            if (envClean && senderClean === envClean) return true;
        }
        if (sock && chatId && chatId.endsWith('@g.us') && senderId.includes('@lid')) {
            try {
                const meta = await sock.groupMetadata(chatId);
                const p = meta.participants.find(x => x.lid && extractNum(x.lid) === extractNum(senderId));
                if (p) {
                    const pNum = extractNum(p.id || p.phoneNumber || '');
                    if (pNum === ownerClean) return true;
                }
            } catch {}
        }
        return false;
    };
}
module.exports = { makeIsOwner, extractNum };
