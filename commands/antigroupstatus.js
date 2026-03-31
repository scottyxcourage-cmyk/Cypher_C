const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/antigroupstatus.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

async function antigroupstatusCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🚫 *Anti Group Status Tag*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.antigroupstatus on\n.antigroupstatus off\n\n_Auto-deletes messages that use status broadcast tags in groups_`, message);
    if (sub==='on')  { save({enabled:true});  return reply(sock, chatId, '✅ Anti-group status tag ON!\nStatus broadcast tags will be auto-deleted.', message); }
    if (sub==='off') { save({enabled:false}); return reply(sock, chatId, '❌ Anti-group status tag OFF.', message); }
}

function isAntigroupstatusEnabled() { return get().enabled; }

async function handleAntigroupstatus(sock, chatId, message, senderId) {
    if (!isAntigroupstatusEnabled()) return;
    if (!chatId.endsWith('@g.us')) return;
    try {
        const msgContent =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || '';

        const contextInfo =
            message.message?.extendedTextMessage?.contextInfo ||
            message.message?.imageMessage?.contextInfo ||
            message.message?.videoMessage?.contextInfo || {};

        const mentionedJids = contextInfo.mentionedJid || [];
        const hasStatusTag  = mentionedJids.includes('status@broadcast');
        const hasTextTag    = /@(everyone|all|group|here)\b/i.test(msgContent);

        if (!hasStatusTag && !hasTextTag) return;

        // Auto-delete the message — no kick, just delete silently
        try {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: false,
                    id: message.key.id,
                    participant: senderId
                }
            });
        } catch {}

        // Quiet warning — no kick
        await sock.sendMessage(chatId, {
            text: `⚠️ @${senderId.split('@')[0]}, status broadcast tags are not allowed here.\n\n_Cypher C 🎯_`,
            mentions: [senderId]
        });
    } catch (e) {
        console.error('antigroupstatus error:', e.message);
    }
}

module.exports = { antigroupstatusCommand, isAntigroupstatusEnabled, handleAntigroupstatus };
