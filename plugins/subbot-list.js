import { jadibotManager } from '../lib/jadibot.js';

export default {
    commands: ['listjadibot', 'listbots'],
    
    async execute(sock, m, { chatId }) {
        const subbots = jadibotManager.getSubbots();
        
        if (subbots.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ No hay sub-bots activos actualmente.'
            });
        }

        let message = `ꕤ *Sub-Bots Activos* (${subbots.length})\n\n`;
        subbots.forEach((bot, i) => {
            message += `${i + 1}. @${bot.userId.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatId, {
            text: message,
            mentions: subbots.map(b => b.userId)
        });
    }
};
