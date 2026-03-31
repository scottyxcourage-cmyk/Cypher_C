const axios = require('axios');
const { reply } = require('./_helper');

const JOKES = ['Why do programmers prefer dark mode? Because light attracts bugs! 🐛','Why did the bot break up with the server? It had too many connection issues 💔','Why do Java developers wear glasses? Because they can't C# 😂','What do you call a fish without eyes? A fsh 🐟','Why don't scientists trust atoms? Because they make up everything! ⚛️'];
const FACTS = ['A group of flamingos is called a flamboyance 🦩','Honey never expires — archaeologists found 3000-year-old honey in Egyptian tombs 🍯','The Eiffel Tower grows 15cm taller in summer due to heat expansion 🗼','A day on Venus is longer than a year on Venus 🪐','Sharks are older than trees 🦈'];
const QUOTES = ['The best time to plant a tree was 20 years ago. The second best time is now. 🌱','In the middle of difficulty lies opportunity. — Einstein ✨','Life is what happens when you\'re busy making other plans. — Lennon 🎵','Be yourself; everyone else is already taken. — Wilde 🎭','The only way to do great work is to love what you do. — Jobs 💫'];
const TRUTHS = ['What\'s the most embarrassing thing you\'ve done in public?','Have you ever lied to get out of trouble?','What\'s your biggest secret?','Have you ever had a crush on someone in this group?','What\'s the worst thing you\'ve ever done?'];
const DARES = ['Send a voice note singing a song 🎤','Change your WhatsApp status to something embarrassing for 1 hour','Tell a joke right now 😂','Do 10 pushups and send a photo as proof 💪','Call someone random and speak only in rhymes'];
const TRIVIA = [
    { q: 'What is the capital of France?', a: 'Paris' },
    { q: 'How many sides does a hexagon have?', a: '6' },
    { q: 'What planet is closest to the sun?', a: 'Mercury' },
    { q: 'Who wrote Romeo and Juliet?', a: 'Shakespeare' },
    { q: 'What is H2O?', a: 'Water' },
];
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const COMPLIMENTS = ['You\'re absolutely amazing! ✨','You light up every room you enter 🌟','Your kindness is contagious 💫','You have an incredible heart ❤️','You make the world a better place 🌍'];
const ROASTS = ['You\'re like a cloud — when you disappear, it\'s a beautiful day ☁️','I\'d agree with you but then we\'d both be wrong 😂','You\'re not stupid; you just have bad luck thinking 💀','I\'d insult you but my mom said I shouldn\'t burn trash 🔥','You\'re proof that even plants can survive without a brain 🌿'];

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

async function jokeCommand(sock, chatId, message) {
    try {
        const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist&type=single', {timeout:8000});
        const joke = res.data?.joke || rand(JOKES);
        await reply(sock, chatId, `😂 *Joke*\n\n${joke}`, message);
    } catch { await reply(sock, chatId, `😂 *Joke*\n\n${rand(JOKES)}`, message); }
}

async function factCommand(sock, chatId, message) {
    try {
        const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', {timeout:8000});
        const fact = res.data?.text || rand(FACTS);
        await reply(sock, chatId, `💡 *Random Fact*\n\n${fact}`, message);
    } catch { await reply(sock, chatId, `💡 *Random Fact*\n\n${rand(FACTS)}`, message); }
}

async function quoteCommand(sock, chatId, message) {
    try {
        const res = await axios.get('https://api.quotable.io/random', {timeout:8000});
        const q = res.data?.content ? `"${res.data.content}"\n\n— ${res.data.author}` : rand(QUOTES);
        await reply(sock, chatId, `✨ *Quote of the Day*\n\n${q}`, message);
    } catch { await reply(sock, chatId, `✨ *Quote of the Day*\n\n${rand(QUOTES)}`, message); }
}

async function roastCommand(sock, chatId, message) {
    await reply(sock, chatId, `🔥 *Roast*\n\n${rand(ROASTS)}`, message);
}

async function complimentCommand(sock, chatId, message) {
    await reply(sock, chatId, `💖 *Compliment*\n\n${rand(COMPLIMENTS)}`, message);
}

async function eightballCommand(sock, chatId, message, args) {
    const responses = ['✅ Yes, definitely!','✅ It is certain','✅ Without a doubt','🤔 Ask again later','🤔 Cannot predict now','🤔 Concentrate and ask again','❌ Don\'t count on it','❌ My sources say no','❌ Very doubtful'];
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Ask a question! .8ball <question>', message);
    await reply(sock, chatId, `🎱 *Magic 8-Ball*\n\n❓ ${q}\n\n${rand(responses)}`, message);
}

async function flipCommand(sock, chatId, message) {
    const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
    await reply(sock, chatId, `🪙 *Coin Flip*\n\n${result}`, message);
}

async function diceCommand(sock, chatId, message, args) {
    const sides = parseInt(args[0]) || 6;
    const result = Math.floor(Math.random()*sides)+1;
    await reply(sock, chatId, `🎲 *Dice Roll (d${sides})*\n\nYou rolled: *${result}*`, message);
}

async function chooseCommand(sock, chatId, message, args) {
    if (!args.length) return reply(sock, chatId, '❌ Usage: .choose <option1> | <option2> | ...', message);
    const options = args.join(' ').split('|').map(s=>s.trim()).filter(Boolean);
    if (options.length < 2) return reply(sock, chatId, '❌ Provide at least 2 options separated by |', message);
    await reply(sock, chatId, `🎯 *Choose*\n\nI choose: *${rand(options)}*`, message);
}

async function loveCommand(sock, chatId, message, args) {
    const pct = Math.floor(Math.random()*101);
    const bar = '█'.repeat(Math.floor(pct/10)) + '░'.repeat(10-Math.floor(pct/10));
    const names = args.join(' ') || 'You two';
    await reply(sock, chatId, `❤️ *Love Calculator*\n\n💑 ${names}\n\n[${bar}] ${pct}%\n\n${pct>80?'💘 Perfect match!':pct>60?'💕 Looking good!':pct>40?'🤔 It could work...':'💔 Maybe just friends?'}`, message);
}

async function shipCommand(sock, chatId, message, args) {
    return loveCommand(sock, chatId, message, args);
}

async function horoscopeCommand(sock, chatId, message, args) {
    const sign = args[0] || rand(SIGNS);
    const moods = ['Today is your lucky day! ⭐','Focus on what matters most 🎯','Great things are coming your way 🌟','Take it easy today, rest is important 😌','A surprise awaits you soon 🎁'];
    await reply(sock, chatId, `♈ *Horoscope: ${sign}*\n\n${rand(moods)}\n\n🌙 Lucky number: ${Math.floor(Math.random()*99)+1}\n💫 Lucky color: ${['Red','Blue','Green','Gold','Purple','White'][Math.floor(Math.random()*6)]}`, message);
}

async function truthCommand(sock, chatId, message) {
    await reply(sock, chatId, `🤔 *Truth*\n\n${rand(TRUTHS)}`, message);
}

async function dareCommand(sock, chatId, message) {
    await reply(sock, chatId, `💪 *Dare*\n\n${rand(DARES)}`, message);
}

async function triviaCommand(sock, chatId, message) {
    const t = rand(TRIVIA);
    await reply(sock, chatId, `🧠 *Trivia*\n\n❓ ${t.q}\n\n_Reply with your answer!_\n\n||Answer: ${t.a}||`, message);
}

async function emojimixCommand(sock, chatId, message, args) {
    const input = args.join(' ').trim();
    const emojis = [...input].filter(c => c.codePointAt(0) > 127);
    if (emojis.length < 2) return reply(sock, chatId, '❌ Provide 2 emojis!\nUsage: .emojimix 😂🔥', message);
    const [e1, e2] = emojis;
    const cp = (e) => [...e].map(c => c.codePointAt(0).toString(16)).join('-');
    const c1 = cp(e1), c2 = cp(e2);
    const DATES = ['20230301','20221101','20220815','20220406','20210831','20210218','20201001'];
    let imgData = null;
    for (const date of DATES) {
        for (const [a, b] of [[c1,c2],[c2,c1]]) {
            try {
                const r = await axios.get(`https://www.gstatic.com/android/keyboard/emojikitchen/${date}/u${a}/u${a}_u${b}.png`, { responseType:'arraybuffer', timeout:8000 });
                if (r.status===200 && r.data?.byteLength>500) { imgData = r.data; break; }
            } catch {}
        }
        if (imgData) break;
    }
    if (!imgData) return reply(sock, chatId, '❌ Combo not supported. Try: .emojimix 😂🔥', message);
    await sock.sendMessage(chatId, { image: Buffer.from(imgData), caption: `✨ ${e1} + ${e2}\n\n_Cypher C 🎯_` }, { quoted: message });
}

async function rateCommand(sock, chatId, message, args) {
    const thing = args.join(' ').trim() || 'that';
    const pct = Math.floor(Math.random()*101);
    const stars = '⭐'.repeat(Math.round(pct/20));
    await reply(sock, chatId, `⭐ *Rate: ${thing}*\n\n${stars}\nScore: *${pct}/100*`, message);
}

async function countryCommand(sock, chatId, message, args) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .country <name>', message);
    try {
        const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(q)}`, {timeout:10000});
        const c = res.data[0];
        const pop = c.population?.toLocaleString();
        const cap = c.capital?.[0] || 'N/A';
        const curr = Object.values(c.currencies||{})[0]?.name || 'N/A';
        const lang = Object.values(c.languages||{})[0] || 'N/A';
        await reply(sock, chatId, `🌍 *${c.name.common}* ${c.flag}\n\n🏛️ Capital: ${cap}\n👥 Population: ${pop}\n💰 Currency: ${curr}\n🗣️ Language: ${lang}\n🌐 Region: ${c.region}`, message);
    } catch { await reply(sock, chatId, '❌ Country not found.', message); }
}

async function weatherCommand(sock, chatId, message, args) {
    const city = args.join(' ').trim();
    if (!city) return reply(sock, chatId, '❌ Usage: .weather <city>', message);
    try {
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`, {timeout:10000});
        await reply(sock, chatId, `🌤️ *Weather*\n\n${res.data}`, message);
    } catch { await reply(sock, chatId, '❌ Could not fetch weather.', message); }
}

async function translateCommand(sock, chatId, message, args) {
    const text = args.slice(1).join(' ').trim();
    const lang = args[0] || 'en';
    if (!text) return reply(sock, chatId, '❌ Usage: .translate <lang> <text>\nExample: .translate fr Hello', message);
    try {
        const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`, {timeout:10000});
        const translated = res.data?.responseData?.translatedText;
        if (!translated) throw new Error();
        await reply(sock, chatId, `🌐 *Translate → ${lang}*\n\n📝 Original: ${text}\n✅ Translated: ${translated}`, message);
    } catch { await reply(sock, chatId, '❌ Translation failed.', message); }
}

async function defineCommand(sock, chatId, message, args) {
    const word = args.join(' ').trim();
    if (!word) return reply(sock, chatId, '❌ Usage: .define <word>', message);
    try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {timeout:10000});
        const entry = res.data[0];
        const meaning = entry.meanings[0];
        const def = meaning.definitions[0].definition;
        const ex = meaning.definitions[0].example || '';
        await reply(sock, chatId, `📚 *${word}*\n🔤 Part: ${meaning.partOfSpeech}\n\n📖 Definition:\n${def}${ex?`\n\n💬 Example:\n_${ex}_`:''}`, message);
    } catch { await reply(sock, chatId, '❌ Word not found.', message); }
}

async function wikiCommand(sock, chatId, message, args) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .wiki <topic>', message);
    try {
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, {timeout:10000});
        const data = res.data;
        if (!data.extract) throw new Error();
        const excerpt = data.extract.substring(0, 600);
        await reply(sock, chatId, `📖 *${data.title}*\n\n${excerpt}${data.extract.length>600?'...':''}\n\n🔗 ${data.content_urls?.desktop?.page||''}`, message);
    } catch { await reply(sock, chatId, '❌ Topic not found.', message); }
}

async function calcCommand(sock, chatId, message, args) {
    const expr = args.join(' ').replace(/[^0-9+\-*/.() %^]/g,'').trim();
    if (!expr) return reply(sock, chatId, '❌ Usage: .calc <expression>', message);
    try {
        // eslint-disable-next-line no-eval
        const result = eval(expr);
        await reply(sock, chatId, `🧮 *Calculator*\n\n📝 ${expr}\n✅ = *${result}*`, message);
    } catch { await reply(sock, chatId, '❌ Invalid expression.', message); }
}

async function reverseCommand(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .reverse <text>', message);
    await reply(sock, chatId, `🔄 *Reverse*\n\n${text.split('').reverse().join('')}`, message);
}

async function encodeCommand(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .encode <text>', message);
    await reply(sock, chatId, `🔐 *Base64 Encode*\n\n${Buffer.from(text).toString('base64')}`, message);
}

async function decodeCommand(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .decode <text>', message);
    try { await reply(sock, chatId, `🔓 *Base64 Decode*\n\n${Buffer.from(text,'base64').toString('utf8')}`, message); }
    catch { await reply(sock, chatId, '❌ Invalid base64 string.', message); }
}

async function upperCommand(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .upper <text>', message);
    await reply(sock, chatId, text.toUpperCase(), message);
}

async function lowerCommand(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .lower <text>', message);
    await reply(sock, chatId, text.toLowerCase(), message);
}

async function qrCommand(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .qr <text>', message);
    try {
        const res = await axios.get(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=300x300`, { responseType:'arraybuffer', timeout:10000 });
        await sock.sendMessage(chatId, { image: Buffer.from(res.data), caption: `🔳 *QR Code*\n\n📝 ${text}\n\n_Cypher C 🎯_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to generate QR code.', message); }
}

async function tinyurlCommand(sock, chatId, message, args) {
    const url = args[0]?.trim();
    if (!url) return reply(sock, chatId, '❌ Usage: .tinyurl <url>', message);
    try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {timeout:10000});
        await reply(sock, chatId, `🔗 *URL Shortener*\n\n📎 Original: ${url}\n✅ Short: ${res.data}`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function passwordCommand(sock, chatId, message, args) {
    const len = parseInt(args[0]) || 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i=0;i<len;i++) pass += chars[Math.floor(Math.random()*chars.length)];
    await reply(sock, chatId, `🔐 *Password Generator*\n\n\`${pass}\`\n\n_Length: ${len} chars_`, message);
}

async function todayCommand(sock, chatId, message) {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    await reply(sock, chatId, `📅 *Today*\n\n📆 ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}\n🕐 ${now.toTimeString().split(' ')[0]} UTC`, message);
}

async function timeCommand(sock, chatId, message) { return todayCommand(sock, chatId, message); }

module.exports = {
    jokeCommand, factCommand, quoteCommand, roastCommand, complimentCommand,
    eightballCommand, flipCommand, diceCommand, chooseCommand, loveCommand,
    shipCommand, horoscopeCommand, truthCommand, dareCommand, triviaCommand,
    emojimixCommand, rateCommand, countryCommand, weatherCommand, translateCommand,
    defineCommand, wikiCommand, calcCommand, reverseCommand, encodeCommand,
    decodeCommand, upperCommand, lowerCommand, qrCommand, tinyurlCommand,
    passwordCommand, todayCommand, timeCommand
};
