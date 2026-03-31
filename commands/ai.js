const axios = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    try {
        const q = args.join(' ').trim();
        if (!q) return reply(sock, chatId, '❌ Usage: .ai <question>', message);
        await sock.sendMessage(chatId, { text: '🤖 Thinking...' }, { quoted: message });
        const res = await axios.get(`https://api.simsimi.vn/v1/simsimi?text=${encodeURIComponent(q)}&lang=en`, { timeout: 15000 });
        const answer = res.data?.success || res.data?.message || res.data?.BotSays;
        if (answer) return await sock.sendMessage(chatId, { text: `🤖 *AI Response*\n\n${answer}\n\n_Cypher C 🎯_` }, { quoted: message });
        throw new Error('no response');
    } catch {
        // fallback to free GPT API
        try {
            const q2 = args.join(' ').trim();
            const res2 = await axios.post('https://api.ryzendesu.vip/api/ai/chatgpt', { text: q2 }, { timeout: 15000 });
            const ans = res2.data?.response || res2.data?.message || res2.data?.answer;
            if (ans) return await sock.sendMessage(chatId, { text: `🤖 *AI Response*\n\n${ans}\n\n_Cypher C 🎯_` }, { quoted: message });
        } catch {}
        await reply(sock, chatId, '❌ AI is unavailable right now. Try again later.', message);
    }
};
