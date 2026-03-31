const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/antidelete.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

async function antideleteCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🗑️ *Anti-Delete*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.antidelete on\n.antidelete off\n\n_Sends deleted messages to your DM_`, message);
    if (sub==='on')  { save({enabled:true});  return reply(sock, chatId, '✅ Anti-delete ON! Deleted messages will be sent to your DM.', message); }
    if (sub==='off') { save({enabled:false}); return reply(sock, chatId, '❌ Anti-delete OFF.', message); }
}

function isAntideleteEnabled() { return get().enabled; }

async function handleAntidelete(sock, mek) {
    if (!isAntideleteEnabled()) return;
    try {
        // protocolMessage type 0 = REVOKE (delete)
        const deletedKey = mek.message?.protocolMessage?.key;
        if (!deletedKey) return;
        if (mek.key.fromMe) return;

        const chatId   = mek.key.remoteJid;
        const deleter  = mek.key.participant || mek.key.remoteJid;
        const ownerJid = (sock._ownerPhone || process.env.OWNER_NUMBER || '') + '@s.whatsapp.net';

        // Get the original message from store
        const stored = await sock._userStore?.loadMessage(deletedKey.remoteJid || chatId, deletedKey.id);

        const header = `🗑️ *Anti-Delete Alert*\n*Who:* @${deleter.split('@')[0]}\n*Where:* ${chatId.endsWith('@g.us') ? 'Group' : 'DM'}\n`;

        if (!stored?.message) {
            // No cached content — just notify owner
            await sock.sendMessage(ownerJid, {
                text: header + '*Content:* _(not cached)_\n\n_Cypher C 🎯_',
                mentions: [deleter]
            });
            return;
        }

        const msg = stored.message;
        const originalSender = stored.key?.participant || stored.key?.remoteJid || deleter;
        const fullHeader = header + `*Original sender:* @${originalSender.split('@')[0]}\n*Content:*\n`;

        const text    = msg?.conversation || msg?.extendedTextMessage?.text;
        const image   = msg?.imageMessage;
        const video   = msg?.videoMessage;
        const audio   = msg?.audioMessage;
        const sticker = msg?.stickerMessage;
        const doc     = msg?.documentMessage;

        if (text) {
            await sock.sendMessage(ownerJid, {
                text: fullHeader + text + '\n\n_Cypher C 🎯_',
                mentions: [deleter, originalSender]
            });
        } else if (image) {
            await sock.sendMessage(ownerJid, {
                image: { url: image.url },
                caption: fullHeader + (image.caption || '(no caption)') + '\n\n_Cypher C 🎯_',
                mentions: [deleter, originalSender]
            });
        } else if (video) {
            await sock.sendMessage(ownerJid, {
                video: { url: video.url },
                caption: fullHeader + (video.caption || '(no caption)') + '\n\n_Cypher C 🎯_',
                mentions: [deleter, originalSender]
            });
        } else if (audio) {
            await sock.sendMessage(ownerJid, {
                audio: { url: audio.url },
                mimetype: audio.mimetype || 'audio/ogg; codecs=opus',
            });
            await sock.sendMessage(ownerJid, { text: fullHeader + '(audio message)\n\n_Cypher C 🎯_', mentions: [deleter, originalSender] });
        } else if (sticker) {
            await sock.sendMessage(ownerJid, { sticker: { url: sticker.url } });
            await sock.sendMessage(ownerJid, { text: fullHeader + '(sticker)\n\n_Cypher C 🎯_', mentions: [deleter, originalSender] });
        } else if (doc) {
            await sock.sendMessage(ownerJid, {
                document: { url: doc.url },
                fileName: doc.fileName || 'file',
                mimetype: doc.mimetype,
            });
            await sock.sendMessage(ownerJid, { text: fullHeader + `(document: ${doc.fileName || 'file'})\n\n_Cypher C 🎯_`, mentions: [deleter, originalSender] });
        } else {
            await sock.sendMessage(ownerJid, {
                text: fullHeader + '(unsupported type)\n\n_Cypher C 🎯_',
                mentions: [deleter, originalSender]
            });
        }
    } catch (e) {
        console.error('antidelete error:', e.message);
    }
}

module.exports = antideleteCommand;
module.exports.isAntideleteEnabled = isAntideleteEnabled;
module.exports.handleAntidelete = handleAntidelete;
