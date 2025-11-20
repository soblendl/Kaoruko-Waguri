export default {
    commands: ['wimage'],
    
    async execute(sock, m, { chatId, args }) {
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Debes especificar el nombre del personaje.\nUso: #wimage <personaje>'
            });
        }

        await sock.sendMessage(chatId, {
            text: `📸 *Imagen de Waifu*\n\n` +
                `Este comando requiere integración con APIs de imágenes.\n` +
                `Por ahora está en modo de demostración.`
        });
    }
};
