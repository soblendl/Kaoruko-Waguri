import { isAdmin, isBotAdmin, extractMentions } from '../lib/utils.js';

export default {
    commands: ['promote'],
    
    async execute(ctx) {
        if (!ctx.isGroup) {
            return await ctx.reply('ꕤ Este comando solo funciona en grupos.');
        }

        const admin = await isAdmin(ctx.bot.sock, ctx.chatId, ctx.sender);
        if (!admin) {
            return await ctx.reply('ꕤ Solo los administradores pueden usar este comando.');
        }

        const botAdmin = await isBotAdmin(ctx.bot.sock, ctx.chatId);
        if (!botAdmin) {
            return await ctx.reply('ꕤ Necesito ser administrador para promover usuarios.');
        }

        const mentions = extractMentions(ctx);
        if (mentions.length === 0) {
            return await ctx.reply('ꕤ Debes mencionar al usuario a promover.');
        }

        try {
            await ctx.bot.sock.groupParticipantsUpdate(ctx.chatId, mentions, 'promote');
            await ctx.reply(`ꕥ @${mentions[0].split('@')[0]} ahora es administrador.`, {
                mentions
            });
        } catch (error) {
            await ctx.reply('ꕤ Error al promover al usuario.');
        }
    }
};
