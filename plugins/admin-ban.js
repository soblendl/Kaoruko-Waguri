import { isAdmin, isBotAdmin, extractMentions } from '../lib/utils.js';

export default {
    commands: ['ban'],
    
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
            return await ctx.reply('ꕤ Necesito ser administrador para banear usuarios.');
        }

        const mentions = extractMentions(ctx);
        if (mentions.length === 0) {
            return await ctx.reply('ꕤ Debes mencionar al usuario a banear.');
        }

        const user = mentions[0];
        const groupData = ctx.dbService.getGroup(ctx.chatId);
        
        if (!groupData.banned) {
            groupData.banned = [];
        }

        if (groupData.banned.includes(user)) {
            return await ctx.reply('ꕤ Ese usuario ya está baneado.');
        }

        groupData.banned.push(user);
        ctx.dbService.markDirty();

        try {
            await ctx.bot.sock.groupParticipantsUpdate(ctx.chatId, [user], 'remove');
            await ctx.reply(`ꕤ @${user.split('@')[0]} ha sido baneado del grupo.`, {
                mentions: [user]
            });
        } catch (error) {
            await ctx.reply('ꕤ Error al banear al usuario.');
        }
    }
};
