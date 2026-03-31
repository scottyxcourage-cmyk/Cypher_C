const cache = new Map();
const TTL   = 5000;
function extractNum(id) {
    if (!id) return '';
    return id.split(':')[0].split('@')[0];
}
async function getMeta(sock, gid) {
    const c = cache.get(gid);
    if (c && Date.now() - c.ts < TTL) return c.data;
    const data = await sock.groupMetadata(gid);
    cache.set(gid, { data, ts: Date.now() });
    return data;
}
async function isAdmin(sock, gid, uid) {
    try {
        if (!sock || !gid || !uid) return false;
        const meta = await getMeta(sock, gid);
        const participants = meta.participants || [];
        const senderNum = extractNum(uid);
        return participants.some(p => {
            if (!p.admin) return false;
            const pNum  = extractNum(p.id || '');
            const pLid  = p.lid ? extractNum(p.lid) : '';
            const pPhone= p.phoneNumber ? extractNum(p.phoneNumber) : '';
            return senderNum === pNum || senderNum === pLid || senderNum === pPhone;
        });
    } catch { return false; }
}
async function isBotAdmin(sock, gid) {
    try {
        const meta = await getMeta(sock, gid);
        const botNum = extractNum(sock.user?.id || '');
        return meta.participants.some(p => p.admin && extractNum(p.id || '') === botNum);
    } catch { return false; }
}
isAdmin.isBotAdmin = isBotAdmin;
module.exports = isAdmin;
