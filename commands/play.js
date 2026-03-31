const yts   = require('yt-search');
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    try {
        const q = args.join(' ').trim();
        if (!q) return reply(sock, chatId, '❌ Usage: .play <song name>', message);
        await sock.sendMessage(chatId, { text: `🔍 Searching: *${q}*...` }, { quoted: message });
        const res = await yts(q);
        const vid = res.videos[0];
        if (!vid) return reply(sock, chatId, '❌ No results found.', message);
        if (vid.duration.seconds > 600) return reply(sock, chatId, '❌ Song too long (max 10 min).', message);
        await sock.sendMessage(chatId, { text: `🎵 *${vid.title}*\n⏱️ ${vid.timestamp}\n👁️ ${vid.views?.toLocaleString()||'?'} views\n⬇️ Downloading...` }, { quoted: message });
        const cobaltRes = await axios.post('https://api.cobalt.tools/api/json', {
            url: vid.url, isAudioOnly: true, aFormat: 'mp3', filenamePattern: 'basic'
        }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 30000 });
        const { status, url } = cobaltRes.data;
        if (!url || !['stream','redirect','success'].includes(status)) return reply(sock, chatId, '❌ Download failed. Try again.', message);
        const tmp = path.join('./temp', `play_${Date.now()}.mp3`);
        const fileRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
        fs.writeFileSync(tmp, fileRes.data);
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmp), mimetype: 'audio/mpeg', fileName: `${vid.title}.mp3` }, { quoted: message });
        try { fs.unlinkSync(tmp); } catch {}
    } catch (e) {
        console.error('play error:', e.message);
        await reply(sock, chatId, '❌ Download failed. Try again.', message);
    }
};
