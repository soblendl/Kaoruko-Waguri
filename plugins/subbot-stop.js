import { jadibotManager } from '../lib/jadibot.js';

export default {
    commands: ['stopjadibot', 'stopbot'],
    
    async execute(sock, m, { chatId, sender }) {
        const result = jadibotManager.stopSubbot(sender);
        await sock.sendMessage(chatId, { text: result.message });
    }
};
