export class WelcomeHandler {
    constructor(dbService) {
        this.dbService = dbService;
    }

    async handle(bot, event) {
        const { id, participants, action } = event;

        // Only handle add and remove
        if (action !== 'add' && action !== 'remove') return;

        try {
            const groupData = this.dbService.getGroup(id);
            if (!groupData || !groupData.settings || !groupData.settings.welcome) {
                return;
            }

            const metadata = await bot.groupMetadata(id);

            for (const participant of participants) {
                const ppUrl = await this.getProfilePicture(bot, participant);
                const userName = participant.split('@')[0];

                if (action === 'add') {
                    await this.sendWelcome(bot, id, participant, metadata.subject, ppUrl);
                } else if (action === 'remove') {
                    await this.sendGoodbye(bot, id, participant, metadata.subject, ppUrl);
                }
            }
        } catch (error) {
            console.error('[WelcomeHandler] Error:', error);
        }
    }

    async getProfilePicture(bot, jid) {
        try {
            return await bot.profilePictureUrl(jid, 'image');
        } catch {
            return 'https://i.pinimg.com/736x/70/dd/61/70dd612c65034b88ebf474a52ef70b46.jpg'; // Default cute image
        }
    }

    async sendWelcome(bot, chatId, userJid, groupName, ppUrl) {
        const text = `
ꕥ *Bienvenido/a a ${groupName}* ꕥ

👋 Hola @${userJid.split('@')[0]}
✨ Esperamos que te diviertas mucho aquí.
📜 No olvides leer las reglas del grupo.

> _*Kaoruko Waguri Bot*_
`.trim();

        await bot.sendMessage(chatId, {
            image: { url: ppUrl },
            caption: text,
            mentions: [userJid]
        });
    }

    async sendGoodbye(bot, chatId, userJid, groupName, ppUrl) {
        const text = `
ꕥ *Adiós* ꕥ

👋 @${userJid.split('@')[0]} se ha ido.
✨ Esperamos verte pronto de nuevo.

> _*Kaoruko Waguri Bot*_
`.trim();

        await bot.sendMessage(chatId, {
            image: { url: ppUrl },
            caption: text,
            mentions: [userJid]
        });
    }
}
