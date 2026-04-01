const { reply } = require('./_helper');
const quotes = ['The only way to do great work is to love what you do. — Steve Jobs','In the middle of every difficulty lies opportunity. — Einstein','It does not matter how slowly you go as long as you do not stop. — Confucius','Believe you can and you\'re halfway there. — Roosevelt','Life is what happens when you\'re busy making other plans. — Lennon'];
module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId, `💬 *Quote of the moment*\n\n_${quotes[Math.floor(Math.random()*quotes.length)]}_`, message);
};