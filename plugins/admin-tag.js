
import { isAdmin } from '../lib/utils.js';

export default {
    commands: ['tag'],
    
    async execute(ctx) {
        if (!ctx.isGroup) {
            return await ctx.reply('ꕤ Este comando solo funciona en grupos.');
        }

        const admin = await isAdmin(ctx.bot.sock, ctx.chatId, ctx.from.id);
        if (!admin) {
            return await ctx.reply('ꕤ Solo los administradores pueden usar este comando.');
        }

        const text = ctx.args.join(' ') || 'Atención a todos!';

        try {
            const groupMetadata = await ctx.bot.sock.groupMetadata(ctx.chatId);
            const participants = groupMetadata.participants.map(p => p.id);

            await ctx.reply(`ꕥ *Anuncio*\n\n${text}`, {
                mentions: participants
            });
        } catch (error) {
            await ctx.reply('ꕤ Error al enviar el anuncio.');
        }
    }
};
