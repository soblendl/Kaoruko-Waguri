import { jadibotManager } from '../lib/jadibot.js';

export default {
    commands: ['code', 'jadibot'],
    
    async execute(sock, m, { chatId, sender }) {
        const code = jadibotManager.createCode(sender);
        
        await sock.sendMessage(chatId, {
            text: `ꕤ *Código de Sub-Bot*\n\n` +
                `Tu código de 8 dígitos es:\n` +
                `\`\`\`${code}\`\`\`\n\n` +
                `Este código expira en 5 minutos.\n` +
                `Usa #qr ${code} para obtener el QR de conexión.`
        });
    }
};
