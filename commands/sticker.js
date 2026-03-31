const { reply, getSender } = require('./_helper');
const settings = require('../settings');
const fs   = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

async function downloadMedia(sock, message) {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const imgMsg = message.message?.imageMessage || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    const vidMsg = message.message?.videoMessage  || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
    const stkMsg = message.message?.stickerMessage|| message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
    let stream, ext;
    if (imgMsg)      { stream = await downloadContentFromMessage(imgMsg, 'image');   ext = 'jpg'; }
    else if (vidMsg) { stream = await downloadContentFromMessage(vidMsg, 'video');   ext = 'mp4'; }
    else if (stkMsg) { stream = await downloadContentFromMessage(stkMsg, 'sticker'); ext = 'webp'; }
    else return null;
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return { buf: Buffer.concat(chunks), ext };
}

module.exports = async (sock, chatId, message, args) => {
    try {
        const media = await downloadMedia(sock, message);
        if (!media) return reply(sock, chatId, '❌ Reply to an image or video.', message);
        const tmp  = path.join('./temp', `stk_${Date.now()}.${media.ext}`);
        const out  = path.join('./temp', `stk_${Date.now()}.webp`);
        fs.writeFileSync(tmp, media.buf);
        const packname = settings.packname || 'Cypher C';
        const author   = settings.author   || '🎯';
        await new Promise((res, rej) => {
            exec(`ffmpeg -i "${tmp}" -vf scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2 -loop 0 -preset default -an -vsync 0 -t 8 "${out}"`, e => e ? rej(e) : res());
        });
        const stickerBuf = fs.readFileSync(out);
        await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: message });
        try { fs.unlinkSync(tmp); fs.unlinkSync(out); } catch {}
    } catch {
        await reply(sock, chatId, '❌ Could not create sticker. Reply to an image or video.', message);
    }
};
