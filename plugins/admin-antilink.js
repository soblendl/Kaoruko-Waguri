import { isAdmin } from '../lib/utils.js';

export default {
    commands: ['antilink'],
    
    async execute(ctx) {
        if (!ctx.isGroup) {
            return await ctx.reply('ꕤ Este comando solo funciona en grupos.');
        }

        const admin = await isAdmin(ctx.bot.sock, ctx.chatId, ctx.sender);
        if (!admin) {
            return await ctx.reply('ꕤ Solo los administradores pueden usar este comando.');
        }

        if (!ctx.args[0] || !['on', 'off'].includes(ctx.args[0].toLowerCase())) {
            return await ctx.reply('ꕤ Uso: #antilink <on/off>');
        }

        const enable = ctx.args[0].toLowerCase() === 'on';
        const groupData = ctx.dbService.getGroup(ctx.chatId);
        groupData.settings.antilink = enable;
        ctx.dbService.markDirty();

        await ctx.reply(`ꕥ Antilink ${enable ? 'activado' : 'desactivado'}.`);
    }
};
