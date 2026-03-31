const { checkAdmin, checkBotAdmin, reply, getSender, getMentioned } = require('./_helper');

async function kickCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone.', message);
    try {
        await sock.groupParticipantsUpdate(chatId, mentioned, 'remove');
        await reply(sock, chatId, `✅ Kicked ${mentioned.map(m=>`@${m.split('@')[0]}`).join(', ')}`, message);
    } catch { await reply(sock, chatId, '❌ Failed to kick.', message); }
}

async function promoteCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone.', message);
    try {
        await sock.groupParticipantsUpdate(chatId, mentioned, 'promote');
        const names = mentioned.map(m=>`@${m.split('@')[0]}`).join(', ');
        await sock.sendMessage(chatId, { text: `⬆️ Promoted ${names} to admin!\n\n_Cypher C 🎯_`, mentions: mentioned }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to promote.', message); }
}

async function demoteCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone.', message);
    try {
        await sock.groupParticipantsUpdate(chatId, mentioned, 'demote');
        const names = mentioned.map(m=>`@${m.split('@')[0]}`).join(', ');
        await sock.sendMessage(chatId, { text: `⬇️ Demoted ${names}.\n\n_Cypher C 🎯_`, mentions: mentioned }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to demote.', message); }
}

async function muteCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    try { await sock.groupSettingUpdate(chatId, 'announcement'); await reply(sock, chatId, '🔇 Group muted! Only admins can send messages.', message); }
    catch { await reply(sock, chatId, '❌ Failed to mute.', message); }
}

async function unmuteCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    try { await sock.groupSettingUpdate(chatId, 'not_announcement'); await reply(sock, chatId, '🔊 Group unmuted!', message); }
    catch { await reply(sock, chatId, '❌ Failed to unmute.', message); }
}

async function lockCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    try { await sock.groupSettingUpdate(chatId, 'locked'); await reply(sock, chatId, '🔒 Group locked! Only admins can edit settings.', message); }
    catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function unlockCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    try { await sock.groupSettingUpdate(chatId, 'unlocked'); await reply(sock, chatId, '🔓 Group unlocked!', message); }
    catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function tagallCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const meta = await sock.groupMetadata(chatId);
    const mentions = meta.participants.map(p => p.id);
    const text = (args.join(' ') || '📢 Attention everyone!') + '\n\n' + mentions.map(m=>`@${m.split('@')[0]}`).join(' ') + '\n\n_Cypher C 🎯_';
    await sock.sendMessage(chatId, { text, mentions }, { quoted: message });
}

async function hidetagCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const meta = await sock.groupMetadata(chatId);
    const mentions = meta.participants.map(p => p.id);
    const text = (args.join(' ') || '📢') + '\n\n_Cypher C 🎯_';
    await sock.sendMessage(chatId, { text, mentions }, { quoted: message });
}

async function groupinfoCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p=>p.admin).map(p=>`@${p.id.split('@')[0]}`);
        const text = `📋 *Group Info*\n\n*Name:* ${meta.subject}\n*ID:* ${chatId}\n*Members:* ${meta.participants.length}\n*Admins:* ${admins.join(', ')}\n*Created:* ${new Date(meta.creation*1000).toLocaleDateString()}\n*Description:* ${meta.desc||'None'}\n\n_Cypher C 🎯_`;
        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to get group info.', message); }
}

async function addCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Bot must be admin.', message);
    const num = args[0]?.replace(/[^0-9]/g,'');
    if (!num) return reply(sock, chatId, '❌ Usage: .add <number>', message);
    try {
        await sock.groupParticipantsUpdate(chatId, [num+'@s.whatsapp.net'], 'add');
        await reply(sock, chatId, `✅ Added +${num} to group!`, message);
    } catch { await reply(sock, chatId, '❌ Could not add. Number may not be on WhatsApp.', message); }
}

async function leaveCommand(sock, chatId, message) {
    const sender = getSender(sock, message);
    const { getIsOwner } = require('./_helper');
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    await reply(sock, chatId, '👋 Leaving group... bye!', message);
    await sock.groupLeave(chatId);
}

async function grouplistCommand(sock, chatId, message) {
    const sender = getSender(sock, message);
    const { getIsOwner } = require('./_helper');
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    try {
        const groups = await sock.groupFetchAllParticipating();
        const list = Object.values(groups).map((g,i)=>`${i+1}. ${g.subject} (${g.participants.length} members)`);
        await reply(sock, chatId, `📋 *Groups (${list.length})*\n\n${list.join('\n')}`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function totalmembersCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const meta = await sock.groupMetadata(chatId);
    await reply(sock, chatId, `👥 *Total Members:* ${meta.participants.length}`, message);
}

async function getlinkCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    try { const code = await sock.groupInviteCode(chatId); await reply(sock, chatId, `🔗 *Invite Link:*\nhttps://chat.whatsapp.com/${code}`, message); }
    catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function resetlinkCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    try { await sock.groupRevokeInvite(chatId); await reply(sock, chatId, '✅ Invite link reset!', message); }
    catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function setnameCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const name = args.join(' ').trim();
    if (!name) return reply(sock, chatId, '❌ Usage: .setname <name>', message);
    try { await sock.groupUpdateSubject(chatId, name); await reply(sock, chatId, `✅ Group name changed to: *${name}*`, message); }
    catch { await reply(sock, chatId, '❌ Failed.', message); }
}

async function setdescCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const desc = args.join(' ').trim();
    if (!desc) return reply(sock, chatId, '❌ Usage: .setdesc <description>', message);
    try { await sock.groupUpdateDescription(chatId, desc); await reply(sock, chatId, '✅ Group description updated!', message); }
    catch { await reply(sock, chatId, '❌ Failed.', message); }
}

const { getSender } = require('./_helper');
module.exports = {
    kickCommand, promoteCommand, demoteCommand, muteCommand, unmuteCommand,
    lockCommand, unlockCommand, tagallCommand, hidetagCommand, groupinfoCommand,
    addCommand, leaveCommand, grouplistCommand, totalmembersCommand,
    getlinkCommand, resetlinkCommand, setnameCommand, setdescCommand
};
