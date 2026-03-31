/**
 * Cypher C 🎯 — Main Message Handler
 */
const fs = require('fs');
const settings = require('./settings');
const { isBanned }    = require('./lib/isBanned');
const { getSender }   = require('./lib/getSender');
const { makeIsOwner } = require('./lib/isOwner');
const { getMode }     = require('./commands/mode');

// ── Imports ───────────────────────────────────────────────────────────────
const helpCmd         = require('./commands/help');
const { pingCommand, aliveCommand, uptimeCommand, ownerCommand, repoCommand, runtimeCommand, botstatus } = require('./commands/system');
const { modeCommand } = require('./commands/mode');
const { antilinkCommand, handleLink }       = require('./commands/antilink');
const { antibadwordCommand, handleBadword } = require('./commands/antibadword');
const { antispamCommand, handleSpam }       = require('./commands/antispam');
const { welcomeCommand, handleJoin }        = require('./commands/welcome');
const { goodbyeCommand, handleLeave }       = require('./commands/goodbye');
const { chatbotCommand, handleChatbot }     = require('./commands/chatbot');
const { autoReplyCommand, handleAutoReply } = require('./commands/autoreply');
const { alwaysOnlineCommand }               = require('./commands/alwaysonline');
const { bcCommand, addUser }               = require('./commands/bc');
const { banCommand, unbanCommand }          = require('./commands/ban');
const { anticallCommand }                   = require('./commands/anticall');
const antideleteCmd                         = require('./commands/antidelete');
const antivoCmd                             = require('./commands/antiviewonce');
const autoreactCmd                          = require('./commands/autoreact');
const autoreadCmd                           = require('./commands/autoread');
const autosaveCmd                           = require('./commands/autosavestatus');
const autoviewstatusCmd                     = require('./commands/autoviewstatus');
const { antigroupstatusCommand, handleAntigroupstatus } = require('./commands/antigroupstatus');
const { antiraidCommand, handleRaid }       = require('./commands/antiraid');
const { afkCommand, checkAfk, clearAfk }   = require('./commands/afk');
const notesCmd                              = require('./commands/notes');
const { warnCommand, warningsCommand, clearwarnCommand, listwarnCommand, setwarnCommand, resetwarnCommand } = require('./commands/warn');
const { kickCommand, promoteCommand, demoteCommand, muteCommand, unmuteCommand, lockCommand, unlockCommand, tagallCommand, hidetagCommand, groupinfoCommand, addCommand, leaveCommand, grouplistCommand, totalmembersCommand, getlinkCommand, resetlinkCommand, setnameCommand, setdescCommand } = require('./commands/group');
const playCmd = require('./commands/play');
const aiCmd   = require('./commands/ai');
const stickerCmd = require('./commands/sticker');
const { jokeCommand, factCommand, quoteCommand, roastCommand, complimentCommand, eightballCommand, flipCommand, diceCommand, chooseCommand, loveCommand, shipCommand, horoscopeCommand, truthCommand, dareCommand, triviaCommand, emojimixCommand, rateCommand, countryCommand, weatherCommand, translateCommand, defineCommand, wikiCommand, calcCommand, reverseCommand, encodeCommand, decodeCommand, upperCommand, lowerCommand, qrCommand, tinyurlCommand, passwordCommand, todayCommand, timeCommand } = require('./commands/fun');
const { tiktokCommand, instagramCommand, savestatusCommand, tomp3Command, toimgCommand, vvCommand, getDpCommand, imageSearchCommand } = require('./commands/media');

async function handleMessages(sock, update) {
    try {
        const { messages, type } = update;
        if (type !== 'notify') return;
        const message = messages[0];
        if (!message?.message) return;

        // Unwrap ephemeral
        if (Object.keys(message.message)[0] === 'ephemeralMessage')
            message.message = message.message.ephemeralMessage.message;

        // ── Anti-delete: catch protocolMessage REVOKE (type 0) ────────────
        if (message.message?.protocolMessage?.type === 0) {
            try { await antideleteCmd.handleAntidelete(sock, message); } catch {}
            return;
        }

        const chatId   = message.key.remoteJid;
        const isGroup  = chatId?.endsWith('@g.us');
        const senderId = getSender(sock, message);

        if (!chatId || !senderId) return;

        // ── Status broadcast ──────────────────────────────────────────────
        if (chatId === 'status@broadcast') {
            try {
                const avs = JSON.parse(fs.readFileSync('./data/autoviewstatus.json','utf8'));
                if (avs.enabled) {
                    await sock.readMessages([message.key]);
                    if (avs.emoji) {
                        await sock.sendMessage('status@broadcast', { react: { text: avs.emoji, key: message.key } });
                    }
                    // Auto-save status
                    try {
                        const aso = JSON.parse(fs.readFileSync('./data/autosavestatus.json','utf8'));
                        if (aso.enabled) {
                            const ownerJid = (sock._ownerPhone||process.env.OWNER_NUMBER||'')+'@s.whatsapp.net';
                            const img = message.message?.imageMessage;
                            const vid = message.message?.videoMessage;
                            if (img || vid) {
                                const type = img ? 'image' : 'video';
                                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                                const stream = await downloadContentFromMessage(img||vid, type);
                                const chunks = []; for await (const c of stream) chunks.push(c);
                                const who = senderId.split('@')[0];
                                await sock.sendMessage(ownerJid, { [type]: Buffer.concat(chunks), caption: `💾 *Status saved!*\n👤 From: +${who}\n\n_Cypher C 🎯_` });
                            }
                        }
                    } catch {}
                }
            } catch {}
            return;
        }

        if (isBanned(senderId)) return;

        const isOwnerFn = makeIsOwner(sock._ownerPhone || '');

        // Private mode
        if (getMode().mode === 'private' && !message.key.fromMe && !await isOwnerFn(senderId, sock, chatId)) return;

        // Track users for broadcast
        if (!isGroup) { addUser(senderId); await handleAutoReply(sock, message); }

        // AFK check
        try {
            const afk = checkAfk(senderId);
            if (afk) {
                clearAfk(senderId);
                const mins = Math.round((Date.now()-afk.time)/60000);
                await sock.sendMessage(chatId, { text: `👋 Welcome back @${senderId.split('@')[0]}!\nYou were AFK for ${mins} min.\nReason was: _${afk.reason}_\n\n_Cypher C 🎯_`, mentions: [senderId] });
            }
        } catch {}

        // Auto-read
        try {
            const ar = JSON.parse(fs.readFileSync('./data/autoread.json','utf8'));
            if (ar.enabled && !message.key.fromMe) await sock.readMessages([message.key]);
        } catch {}

        // Auto-react
        try {
            const arc = JSON.parse(fs.readFileSync('./data/autoreact.json','utf8'));
            if (arc.enabled && !message.key.fromMe) {
                await sock.sendMessage(chatId, { react: { text: arc.emoji||'❤️', key: message.key } });
            }
        } catch {}

        // Group handlers
        if (isGroup) {
            await handleLink(sock, chatId, message);
            await handleBadword(sock, chatId, message);
            await handleSpam(sock, chatId, message, senderId);
            await handleAntigroupstatus(sock, chatId, message, senderId);
            // AFK mention check
            try {
                const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                for (const m of mentioned) {
                    const afkData = checkAfk(m);
                    if (afkData) {
                        const mins = Math.round((Date.now()-afkData.time)/60000);
                        await sock.sendMessage(chatId, { text: `😴 @${m.split('@')[0]} is AFK (${mins}m)\nReason: _${afkData.reason}_\n\n_Cypher C 🎯_`, mentions: [m] });
                    }
                }
            } catch {}
        }

        const rawText =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || '';

        // Chatbot (non-command messages in group)
        if (isGroup && rawText && !rawText.startsWith(settings.prefix)) {
            await handleChatbot(sock, chatId, message, rawText);
        }

        const prefix = settings.prefix || '.';
        if (!rawText.trim().startsWith(prefix)) return;

        const [cmd] = rawText.trim().slice(prefix.length).toLowerCase().split(/\s+/);
        const args  = rawText.trim().slice(prefix.length).split(/\s+/).slice(1);

        switch (cmd) {
            // ── SYSTEM ──────────────────────────────────────────────────
            case 'help': case 'menu': case 'start':
                await helpCmd(sock, chatId, message); break;
            case 'ping':
                await pingCommand(sock, chatId, message); break;
            case 'alive': case 'bot':
                await aliveCommand(sock, chatId, message); break;
            case 'uptime':
                await uptimeCommand(sock, chatId, message); break;
            case 'owner':
                await ownerCommand(sock, chatId, message); break;
            case 'repo': case 'info':
                await repoCommand(sock, chatId, message); break;
            case 'botstatus':
                await botstatus(sock, chatId, message); break;
            case 'mode':
                await modeCommand(sock, chatId, message, args); break;
            case 'grouplist': case 'groups':
                await grouplistCommand(sock, chatId, message); break;

            // ── AI ───────────────────────────────────────────────────────
            case 'ai': case 'ask': case 'gpt':
                await aiCmd(sock, chatId, message, args); break;
            case 'chatbot': case 'cb':
                await chatbotCommand(sock, chatId, message, args); break;

            // ── MEDIA ────────────────────────────────────────────────────
            case 'play': case 'song':
                await playCmd(sock, chatId, message, args); break;
            case 'sticker': case 's':
                await stickerCmd(sock, chatId, message); break;
            case 'tiktok': case 'tt':
                await tiktokCommand(sock, chatId, message, args); break;
            case 'ig': case 'instagram':
                await instagramCommand(sock, chatId, message, args); break;
            case 'savestatus':
                await savestatusCommand(sock, chatId, message); break;
            case 'tomp3': case 'toaudio':
                await tomp3Command(sock, chatId, message); break;
            case 'toimg':
                await toimgCommand(sock, chatId, message); break;
            case 'vv': case 'viewonce':
                await vvCommand(sock, chatId, message); break;
            case 'getdp': case 'dp':
                await getDpCommand(sock, chatId, message); break;
            case 'image': case 'img':
                await imageSearchCommand(sock, chatId, message, args); break;

            // ── GROUP ────────────────────────────────────────────────────
            case 'kick': case 'remove':
                await kickCommand(sock, chatId, message); break;
            case 'add':
                await addCommand(sock, chatId, message, args); break;
            case 'promote':
                await promoteCommand(sock, chatId, message); break;
            case 'demote':
                await demoteCommand(sock, chatId, message); break;
            case 'mute':
                await muteCommand(sock, chatId, message); break;
            case 'unmute':
                await unmuteCommand(sock, chatId, message); break;
            case 'lock':
                await lockCommand(sock, chatId, message); break;
            case 'unlock':
                await unlockCommand(sock, chatId, message); break;
            case 'tagall': case 'everyone':
                await tagallCommand(sock, chatId, message, args); break;
            case 'hidetag': case 'ht':
                await hidetagCommand(sock, chatId, message, args); break;
            case 'groupinfo': case 'ginfo':
                await groupinfoCommand(sock, chatId, message); break;
            case 'totalmembers':
                await totalmembersCommand(sock, chatId, message); break;
            case 'getlink': case 'invitelink':
                await getlinkCommand(sock, chatId, message); break;
            case 'resetlink':
                await resetlinkCommand(sock, chatId, message); break;
            case 'setname':
                await setnameCommand(sock, chatId, message, args); break;
            case 'setdesc':
                await setdescCommand(sock, chatId, message, args); break;
            case 'leave':
                await leaveCommand(sock, chatId, message); break;

            // ── PROTECTION ───────────────────────────────────────────────
            case 'antilink':
                await antilinkCommand(sock, chatId, message, args); break;
            case 'antibadword': case 'abw':
                await antibadwordCommand(sock, chatId, message, args); break;
            case 'antispam':
                await antispamCommand(sock, chatId, message, args); break;
            case 'antiviewonce': case 'antiview':
                await antivoCmd(sock, chatId, message, args); break;
            case 'antiraid':
                await antiraidCommand(sock, chatId, message, args); break;
            case 'anticall':
                await anticallCommand(sock, chatId, message, args); break;
            case 'antidelete':
                await antideleteCmd(sock, chatId, message, args); break;
            case 'antigroupstatus':
                await antigroupstatusCommand(sock, chatId, message, args); break;
            case 'warn':
                await warnCommand(sock, chatId, message); break;
            case 'warnings': case 'warnlist':
                await warningsCommand(sock, chatId, message); break;
            case 'clearwarn':
                await clearwarnCommand(sock, chatId, message); break;
            case 'listwarn':
                await listwarnCommand(sock, chatId, message); break;
            case 'setwarn':
                await setwarnCommand(sock, chatId, message, args); break;
            case 'resetwarn':
                await resetwarnCommand(sock, chatId, message); break;
            case 'ban':
                await banCommand(sock, chatId, message); break;
            case 'unban':
                await unbanCommand(sock, chatId, message); break;

            // ── AUTOMATION ───────────────────────────────────────────────
            case 'autoviewstatus':
                await autoviewstatusCmd(sock, chatId, message, args); break;
            case 'autosavestatus':
                await autosaveCmd(sock, chatId, message, args); break;
            case 'autoreact':
                await autoreactCmd(sock, chatId, message, args); break;
            case 'autoread':
                await autoreadCmd(sock, chatId, message, args); break;
            case 'autoreply': case 'ar':
                await autoReplyCommand(sock, chatId, message, args); break;
            case 'alwaysonline': case 'ao':
                await alwaysOnlineCommand(sock, chatId, message, args); break;
            case 'afk':
                await afkCommand(sock, chatId, message, args); break;
            case 'welcome':
                await welcomeCommand(sock, chatId, message, args); break;
            case 'goodbye': case 'bye':
                await goodbyeCommand(sock, chatId, message, args); break;
            case 'chatbot2':
                await chatbotCommand(sock, chatId, message, args); break;
            case 'bc': case 'broadcast':
                await bcCommand(sock, chatId, message, args); break;
            case 'notes':
                await notesCmd(sock, chatId, message, args); break;

            // ── FUN ──────────────────────────────────────────────────────
            case 'joke':
                await jokeCommand(sock, chatId, message); break;
            case 'fact':
                await factCommand(sock, chatId, message); break;
            case 'quote':
                await quoteCommand(sock, chatId, message); break;
            case 'roast':
                await roastCommand(sock, chatId, message); break;
            case 'compliment': case 'praise':
                await complimentCommand(sock, chatId, message); break;
            case '8ball':
                await eightballCommand(sock, chatId, message, args); break;
            case 'flip': case 'coin':
                await flipCommand(sock, chatId, message); break;
            case 'dice': case 'roll':
                await diceCommand(sock, chatId, message, args); break;
            case 'choose': case 'pick':
                await chooseCommand(sock, chatId, message, args); break;
            case 'love':
                await loveCommand(sock, chatId, message, args); break;
            case 'ship':
                await shipCommand(sock, chatId, message, args); break;
            case 'horoscope':
                await horoscopeCommand(sock, chatId, message, args); break;
            case 'truth':
                await truthCommand(sock, chatId, message); break;
            case 'dare':
                await dareCommand(sock, chatId, message); break;
            case 'trivia':
                await triviaCommand(sock, chatId, message); break;
            case 'emojimix':
                await emojimixCommand(sock, chatId, message, args); break;
            case 'rate':
                await rateCommand(sock, chatId, message, args); break;

            // ── TOOLS ────────────────────────────────────────────────────
            case 'translate': case 'tr':
                await translateCommand(sock, chatId, message, args); break;
            case 'define': case 'dict':
                await defineCommand(sock, chatId, message, args); break;
            case 'wiki': case 'wikipedia':
                await wikiCommand(sock, chatId, message, args); break;
            case 'calc': case 'math':
                await calcCommand(sock, chatId, message, args); break;
            case 'weather':
                await weatherCommand(sock, chatId, message, args); break;
            case 'country':
                await countryCommand(sock, chatId, message, args); break;
            case 'reverse':
                await reverseCommand(sock, chatId, message, args); break;
            case 'encode':
                await encodeCommand(sock, chatId, message, args); break;
            case 'decode':
                await decodeCommand(sock, chatId, message, args); break;
            case 'upper': case 'uppercase':
                await upperCommand(sock, chatId, message, args); break;
            case 'lower': case 'lowercase':
                await lowerCommand(sock, chatId, message, args); break;
            case 'qr': case 'qrcode':
                await qrCommand(sock, chatId, message, args); break;
            case 'tinyurl':
                await tinyurlCommand(sock, chatId, message, args); break;
            case 'password': case 'pass':
                await passwordCommand(sock, chatId, message, args); break;
            case 'today':
                await todayCommand(sock, chatId, message); break;
            case 'time':
                await timeCommand(sock, chatId, message); break;

            default: break;
        }
    } catch(e) {
        if (!e.message?.includes('Connection')) console.error('handleMessages error:', e.message);
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        if (!id.endsWith('@g.us')) return;
        if (action === 'add')    { await handleJoin(sock, id, participants); await handleRaid(sock, id, participants); }
        if (action === 'remove') await handleLeave(sock, id, participants);
    } catch(e) { console.error('group update error:', e.message); }
}

module.exports = { handleMessages, handleGroupParticipantUpdate };
