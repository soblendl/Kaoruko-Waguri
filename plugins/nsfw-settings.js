import { isAdmin } from '../lib/utils.js';

export default {
    commands: ['porn'],
    
    async execute(sock, m, { chatId, sender, args, isGroup }) {
        if (!isGroup) {
            return await sock.sendMessage(chatId, { text: 'ꕤ Este comando solo funciona en grupos.' });
        }

        const admin = await isAdmin(sock, chatId, sender);
        if (!admin) {
            return await sock.sendMessage(chatId, { text: 'ꕤ Solo los administradores pueden usar este comando.' });
        }

        if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
            return await sock.sendMessage(chatId, { text: 'ꕤ Uso: #porn <on/off>' });
        }

        const enable = args[0].toLowerCase() === 'on';
        global.db.groups[chatId].settings.porn = enable;

        await sock.sendMessage(chatId, {
            text: `ꕤ Comandos NSFW ${enable ? 'activados' : 'desactivados'}.`
        });
    }
};
