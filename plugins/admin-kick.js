
import { isAdmin, isBotAdmin, extractMentions } from '../lib/utils.js';

export default {
    commands: ['kick'],
    
    async execute(ctx) {
        if (!ctx.isGroup) {
            return await ctx.reply('ꕤ Este comando solo funciona en grupos.');
        }

        const admin = await isAdmin(ctx.bot.sock, ctx.chatId, ctx.from.id);
        if (!admin) {
            return await ctx.reply('ꕤ Solo los administradores pueden usar este comando.');
        }

        const botAdmin = await isBotAdmin(ctx.bot.sock, ctx.chatId);
        if (!botAdmin) {
            return await ctx.reply('ꕤ Necesito ser administrador para expulsar usuarios.');
        }

        const mentions = extractMentions(ctx);
        if (mentions.length === 0) {
            return await ctx.reply('ꕤ Debes mencionar al usuario a expulsar.');
        }

        for (const user of mentions) {
            try {
                await ctx.bot.sock.groupParticipantsUpdate(ctx.chatId, [user], 'remove');
                await ctx.reply(`ꕥ @${user.split('@')[0]} ha sido expulsado del grupo.`, {
                    mentions: [user]
                });
            } catch (error) {
                await ctx.reply('ꕤ Error al expulsar al usuario.');
            }
        }
    }
};
