const { reply, getSender, getIsOwner } = require('./_helper');
const settings = require('../settings');

async function pingCommand(sock, chatId, message) {
    const start = Date.now();
    await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: message });
    const ms = Date.now() - start;
    await reply(sock, chatId, `🎯 *Cypher C*\n\n🏓 Pong!\n⚡ Speed: *${ms}ms*\n✅ Bot is alive!`, message);
}

async function aliveCommand(sock, chatId, message) {
    const uptime = process.uptime();
    const h = Math.floor(uptime/3600), m = Math.floor((uptime%3600)/60), s = Math.floor(uptime%60);
    await reply(sock, chatId,
        `🎯 *Cypher C v${settings.version}*\n\n` +
        `✅ *Online & Ready!*\n` +
        `⏱️ Uptime: *${h}h ${m}m ${s}s*\n` +
        `🧠 RAM: *${(process.memoryUsage().rss/1024/1024).toFixed(1)}MB*\n` +
        `📡 Node: *${process.version}*`, message);
}

async function uptimeCommand(sock, chatId, message) {
    const uptime = process.uptime();
    const h = Math.floor(uptime/3600), m = Math.floor((uptime%3600)/60), s = Math.floor(uptime%60);
    await reply(sock, chatId, `⏱️ *Uptime:* ${h}h ${m}m ${s}s`, message);
}

async function ownerCommand(sock, chatId, message) {
    const ownerNum = sock._ownerPhone || process.env.OWNER_NUMBER || 'Unknown';
    await reply(sock, chatId, `👑 *Bot Owner*\n\n📱 +${ownerNum}\n\n_Cypher C 🎯_`, message);
}

async function repoCommand(sock, chatId, message) {
    await reply(sock, chatId, `🎯 *Cypher C Bot*\n\nVersion: v${settings.version}\nPrefix: ${settings.prefix}\nPowered by: @whiskeysockets/baileys`, message);
}

async function runtimeCommand(sock, chatId, message) { return uptimeCommand(sock, chatId, message); }

async function botstatus(sock, chatId, message) {
    const mb = (process.memoryUsage().rss/1024/1024).toFixed(1);
    const uptime = process.uptime();
    const h = Math.floor(uptime/3600), m = Math.floor((uptime%3600)/60), s = Math.floor(uptime%60);
    await reply(sock, chatId,
        `🎯 *Bot Status*\n\n` +
        `⏱️ Uptime: ${h}h ${m}m ${s}s\n` +
        `🧠 RAM: ${mb}MB\n` +
        `📡 Node: ${process.version}\n` +
        `🌐 Platform: ${process.platform}`, message);
}

module.exports = { pingCommand, aliveCommand, uptimeCommand, ownerCommand, repoCommand, runtimeCommand, botstatus };
