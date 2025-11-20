import { jadibotManager } from '../lib/jadibot.js';

export default {
    commands: ['qr'],
    
    async execute(sock, m, { chatId, sender, args }) {
        if (!args[0]) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Debes proporcionar un código.\nUso: #qr <código>'
            });
        }

        await sock.sendMessage(chatId, {
            text: 'ꕤ Iniciando sub-bot, por favor espera...'
        });

        const result = await jadibotManager.startSubbot(args[0], chatId, sock);
        
        if (!result.success) {
            await sock.sendMessage(chatId, { text: result.message });
        }
    }
};
