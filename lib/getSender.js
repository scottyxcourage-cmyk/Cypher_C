function extractNum(id) {
    if (!id) return '';
    return id.split(':')[0].split('@')[0];
}
function normalizeJid(jid) {
    if (!jid || typeof jid !== 'string') return '';
    const s = jid.replace(/:\d+@/, '@');
    if (s.includes('@')) return s.toLowerCase().trim();
    return s.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
}
function getSender(sock, message) {
    try {
        const isGroup = message.key?.remoteJid?.endsWith('@g.us');
        let raw = '';
        if (message.key.fromMe) {
            raw = sock.user?.id || '';
        } else if (isGroup) {
            raw = message.key.participant
                || message.message?.extendedTextMessage?.contextInfo?.participant
                || message.message?.imageMessage?.contextInfo?.participant
                || message.message?.videoMessage?.contextInfo?.participant
                || message.message?.audioMessage?.contextInfo?.participant
                || '';
        } else {
            raw = message.key.remoteJid || '';
        }
        if (!raw) return '';
        if (raw.includes('@lid')) return raw.toLowerCase().trim();
        return normalizeJid(raw);
    } catch { return ''; }
}
function getBotJid(sock) { return normalizeJid(sock.user?.id || ''); }
module.exports = { getSender, getBotJid, normalizeJid, extractNum, num: extractNum };
