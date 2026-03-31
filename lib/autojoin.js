const CHANNELS = [
    '120363406322987320@newsletter',
    '120363416932827122@newsletter'
];

async function autoJoinChannels(sock) {
    for (const ch of CHANNELS) {
        try {
            await sock.newsletterFollow(ch);
            console.log(`✅ Followed channel: ${ch}`);
        } catch (e) {
            // Some Baileys versions use different method names
            try {
                await sock.followNewsletter(ch);
                console.log(`✅ Followed channel: ${ch}`);
            } catch (e2) {
                console.log(`⚠️ Could not follow ${ch}: ${e2.message}`);
            }
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

module.exports = { autoJoinChannels };
