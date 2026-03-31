const { reply, getSender } = require('./_helper');
const settings = require('../settings');

module.exports = async (sock, chatId, message) => {
    const uptime = process.uptime();
    const h = Math.floor(uptime/3600), m = Math.floor((uptime%3600)/60);
    const text =
`╔═══════════════════════╗
║   🎯  *CYPHER C BOT*   ║
║   v${settings.version} • Always Ready  ║
╚═══════════════════════╝

⏱️ Uptime: *${h}h ${m}m* | Prefix: *${settings.prefix}*

━━━━━━━━━━━━━━━━━━━━━━━
🤖 *AI & SMART*
━━━━━━━━━━━━━━━━━━━━━━━
• .ai <question> — AI chat
• .chatbot on/off — Group AI
• .autoreply set/on/off
• .translate <lang> <text>
• .define <word>
• .wiki <topic>

━━━━━━━━━━━━━━━━━━━━━━━
🎵 *MEDIA & DOWNLOADS*
━━━━━━━━━━━━━━━━━━━━━━━
• .play <song> — Download audio
• .tiktok <url>
• .ig <url> — Instagram
• .sticker — Image/video → sticker
• .tomp3 — Video → MP3
• .toimg — Sticker → Image
• .vv — Reveal view-once
• .getdp — Profile photo
• .savestatus — Save status
• .image <query> — Image search

━━━━━━━━━━━━━━━━━━━━━━━
👥 *GROUP MANAGEMENT*
━━━━━━━━━━━━━━━━━━━━━━━
• .kick @user
• .add <number>
• .promote / .demote @user
• .mute / .unmute
• .lock / .unlock
• .tagall <msg>
• .hidetag <msg>
• .groupinfo
• .getlink / .resetlink
• .setname / .setdesc
• .totalmembers
• .welcome on/off/set
• .goodbye on/off/set

━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *PROTECTION*
━━━━━━━━━━━━━━━━━━━━━━━
• .antilink on/off
• .antibadword on/off/add
• .antispam on/off
• .antiviewonce on/off
• .antiraid on/off
• .anticall on/off
• .antidelete on/off
• .antigroupstatus on/off
• .warn @user
• .warnings / .clearwarn
• .ban / .unban @user

━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *AUTOMATION*
━━━━━━━━━━━━━━━━━━━━━━━
• .autoviewstatus on/off
• .autosavestatus on/off
• .autoreact on/off/emoji
• .autoread on/off
• .alwaysonline on/off
• .mode public/private
• .afk <reason>
• .bc <message>

━━━━━━━━━━━━━━━━━━━━━━━
🎮 *FUN & GAMES*
━━━━━━━━━━━━━━━━━━━━━━━
• .joke / .fact / .quote
• .roast / .compliment
• .8ball <question>
• .flip / .dice / .choose
• .love / .ship
• .truth / .dare
• .trivia
• .emojimix 😂🔥
• .horoscope <sign>
• .rate <thing>

━━━━━━━━━━━━━━━━━━━━━━━
🔧 *TOOLS*
━━━━━━━━━━━━━━━━━━━━━━━
• .calc <expr>
• .qr <text>
• .tinyurl <url>
• .encode / .decode
• .upper / .lower / .reverse
• .password <length>
• .weather <city>
• .country <name>
• .today / .time
• .notes save/get/list/delete

━━━━━━━━━━━━━━━━━━━━━━━
📊 *SYSTEM*
━━━━━━━━━━━━━━━━━━━━━━━
• .ping — Speed test
• .alive — Bot status
• .uptime
• .owner
• .grouplist

> *Cypher C 🎯 — Always Sharp*`;

    await sock.sendMessage(chatId, { text }, { quoted: message });
};
