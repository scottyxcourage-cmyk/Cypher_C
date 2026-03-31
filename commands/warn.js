const fs = require('fs');
const { checkAdmin, reply, getSender, getMentioned } = require('./_helper');
const settings = require('../settings');
const FILE = './data/warnings.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

async function warnCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone to warn.', message);
    const target = mentioned[0];
    const d = get();
    if (!d[chatId]) d[chatId] = {};
    if (!d[chatId][target]) d[chatId][target] = 0;
    d[chatId][target]++;
    save(d);
    const limit = settings.warnLimit || 3;
    const count = d[chatId][target];
    if (count >= limit) {
        d[chatId][target] = 0; save(d);
        try { await sock.groupParticipantsUpdate(chatId, [target], 'remove'); } catch {}
        return reply(sock, chatId, `🚫 @${target.split('@')[0]} reached ${limit} warnings and was kicked!\n\n_Cypher C 🎯_`, message);
    }
    await sock.sendMessage(chatId, { text: `⚠️ @${target.split('@')[0]} warned! (${count}/${limit})\n\n_Cypher C 🎯_`, mentions: [target] }, { quoted: message });
}

async function warningsCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const d = get();
    const gd = d[chatId] || {};
    const list = Object.entries(gd).filter(([,v])=>v>0).map(([k,v])=>`@${k.split('@')[0]}: ${v} warn(s)`);
    return reply(sock, chatId, list.length ? `📋 *Warnings*\n\n${list.join('\n')}` : '✅ No warnings in this group.', message);
}

async function clearwarnCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone.', message);
    const target = mentioned[0];
    const d = get();
    if (d[chatId]) d[chatId][target] = 0;
    save(d);
    await sock.sendMessage(chatId, { text: `✅ Warnings cleared for @${target.split('@')[0]}\n\n_Cypher C 🎯_`, mentions: [target] }, { quoted: message });
}

async function listwarnCommand(sock, chatId, message) { return warningsCommand(sock, chatId, message); }
async function setwarnCommand(sock, chatId, message, args) {
    return reply(sock, chatId, `⚙️ Warn limit is set in settings.js (current: ${settings.warnLimit})`, message);
}
async function resetwarnCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const d = get(); d[chatId] = {}; save(d);
    return reply(sock, chatId, '✅ All warnings reset for this group.', message);
}

module.exports = { warnCommand, warningsCommand, clearwarnCommand, listwarnCommand, setwarnCommand, resetwarnCommand };
