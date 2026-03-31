const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const { reply, getSender, getIsOwner } = require('./_helper');

async function tiktokCommand(sock, chatId, message, args) {
    const url = args[0]?.trim();
    if (!url || !url.includes('tiktok')) return reply(sock, chatId, '❌ Usage: .tiktok <tiktok url>', message);
    await sock.sendMessage(chatId, { text: '⬇️ Downloading TikTok...' }, { quoted: message });
    try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {timeout:20000});
        const data = res.data;
        const videoUrl = data?.video?.noWatermark || data?.video?.watermark;
        if (!videoUrl) throw new Error('No video URL');
        await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: `🎵 ${data?.title||'TikTok Video'}\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to download TikTok. Try another link.', message); }
}

async function instagramCommand(sock, chatId, message, args) {
    const url = args[0]?.trim();
    if (!url || !url.includes('instagram')) return reply(sock, chatId, '❌ Usage: .ig <instagram url>', message);
    await sock.sendMessage(chatId, { text: '⬇️ Downloading Instagram...' }, { quoted: message });
    try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download/instagram?url=${encodeURIComponent(url)}`, {timeout:20000});
        const videoUrl = res.data?.url || res.data?.video;
        if (!videoUrl) throw new Error();
        await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: `📸 Instagram\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed. Try a public post.', message); }
}

async function savestatusCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return reply(sock, chatId, '❌ Reply to a status to save it.', message);
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const imgMsg = quoted?.imageMessage;
        const vidMsg = quoted?.videoMessage;
        if (!imgMsg && !vidMsg) return reply(sock, chatId, '❌ Status must be an image or video.', message);
        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg||vidMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);
        await sock.sendMessage(chatId, { [type]: buf, caption: `💾 *Status Saved!*\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to save status.', message); }
}

async function tomp3Command(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const vidMsg = quoted?.videoMessage || message.message?.videoMessage;
        if (!vidMsg) return reply(sock, chatId, '❌ Reply to a video to convert to MP3.', message);
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const { exec } = require('child_process');
        await sock.sendMessage(chatId, { text: '🎵 Converting to MP3...' }, { quoted: message });
        const stream = await downloadContentFromMessage(vidMsg, 'video');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `v2a_${Date.now()}.mp4`);
        const tmpOut = path.join('./temp', `v2a_${Date.now()}.mp3`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        await new Promise((res,rej) => exec(`ffmpeg -i "${tmpIn}" -vn -acodec mp3 "${tmpOut}"`, e => e?rej(e):res()));
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Conversion failed. Make sure ffmpeg is installed.', message); }
}

async function toimgCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stkMsg = quoted?.stickerMessage || message.message?.stickerMessage;
        if (!stkMsg) return reply(sock, chatId, '❌ Reply to a sticker to convert to image.', message);
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const { exec } = require('child_process');
        const stream = await downloadContentFromMessage(stkMsg, 'sticker');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `stk_${Date.now()}.webp`);
        const tmpOut = path.join('./temp', `stk_${Date.now()}.png`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        await new Promise((res,rej) => exec(`ffmpeg -i "${tmpIn}" "${tmpOut}"`, e => e?rej(e):res()));
        await sock.sendMessage(chatId, { image: fs.readFileSync(tmpOut), caption: '🖼️ Sticker → Image\n\n_Cypher C 🎯_' }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Conversion failed.', message); }
}

async function vvCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const voMsg = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message;
        if (!voMsg) return reply(sock, chatId, '❌ Reply to a view-once message.', message);
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const imgMsg = voMsg?.imageMessage;
        const vidMsg = voMsg?.videoMessage;
        if (!imgMsg && !vidMsg) return reply(sock, chatId, '❌ No media found in view-once.', message);
        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg||vidMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        await sock.sendMessage(chatId, { [type]: Buffer.concat(chunks), caption: `👁️ View-Once Revealed\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to reveal view-once.', message); }
}

async function getDpCommand(sock, chatId, message) {
    try {
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const target = mentioned?.[0] || message.key.remoteJid;
        const url = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(chatId, { image: { url }, caption: `🖼️ Profile Photo\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ No profile photo / privacy settings prevent this.', message); }
}

async function imageSearchCommand(sock, chatId, message, args) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .image <search query>', message);
    await sock.sendMessage(chatId, { text: `🔍 Searching image: *${q}*...` }, { quoted: message });
    try {
        const res = await axios.get(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(q)}&client_id=LknFBnQsRmUMIJLfqOIRHkKJkxbhpJjxSdUZQjrBHrw`, {timeout:10000});
        const url = res.data?.urls?.regular;
        if (!url) throw new Error();
        await sock.sendMessage(chatId, { image: { url }, caption: `🖼️ *${q}*\nPhoto by ${res.data?.user?.name||'Unknown'} on Unsplash\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch {
        try {
            const r2 = await axios.get(`https://source.unsplash.com/600x400/?${encodeURIComponent(q)}`, { responseType:'arraybuffer', timeout:15000, maxRedirects:5 });
            await sock.sendMessage(chatId, { image: Buffer.from(r2.data), caption: `🖼️ *${q}*\n\n_Cypher C 🎯_` }, { quoted: message });
        } catch { await reply(sock, chatId, '❌ Image search failed.', message); }
    }
}

module.exports = { tiktokCommand, instagramCommand, savestatusCommand, tomp3Command, toimgCommand, vvCommand, getDpCommand, imageSearchCommand };
