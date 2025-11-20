import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    commands: ['sticker', 's'],
    
    async execute(ctx) {
        try {
            const messageType = Object.keys(ctx.message || {})[0];
            
            if (messageType !== 'imageMessage' && messageType !== 'videoMessage') {
                const quotedMsg = ctx.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (!quotedMsg?.imageMessage && !quotedMsg?.videoMessage) {
                    return await ctx.reply('ꕤ Debes enviar una imagen o video, o responder a uno.');
                }
            }

            await ctx.reply('⏳ Creando sticker...');

            const buffer = await downloadMediaMessage(ctx._raw, 'buffer', {});
            
            await ctx.bot.sock.sendMessage(ctx.chatId, {
                sticker: buffer
            });
        } catch (error) {
            console.error('Error creando sticker:', error);
            await ctx.reply('ꕤ Error al crear el sticker.');
        }
    }
};
