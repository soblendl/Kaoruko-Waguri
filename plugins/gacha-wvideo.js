export default {
    commands: ['wvideo'],
    
    async execute(sock, m, { chatId, args }) {
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Debes especificar el nombre del personaje.\nUso: #wvideo <personaje>'
            });
        }

        await sock.sendMessage(chatId, {
            text: `🎥 *Video de Waifu*\n\n` +
                `Este comando requiere integración con APIs de videos.\n` +
                `Por ahora está en modo de demostración.`
        });
    }
};
