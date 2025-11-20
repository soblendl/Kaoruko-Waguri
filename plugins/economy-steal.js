
import { formatNumber, extractMentions } from '../lib/utils.js';

export default {
    commands: ['steal'],
    
    async execute(ctx) {
        if (ctx.isGroup && !ctx.dbService.getGroup(ctx.chatId).settings.economy) {
            return await ctx.reply('ꕤ El sistema de economía está desactivado en este grupo.');
        }

        const mentions = extractMentions(ctx);
        if (mentions.length === 0) {
            return await ctx.reply('ꕤ Debes mencionar a un usuario.\nUso: #steal @usuario');
        }

        const target = mentions[0];
        if (target === ctx.sender) {
            return await ctx.reply('ꕤ No puedes robarte a ti mismo.');
        }

        const userData = ctx.userData.economy;
        const targetData = ctx.dbService.getUser(target).economy;

        const SUCCESS_RATE = 0.5;
        const success = Math.random() < SUCCESS_RATE;

        if (success) {
            const maxSteal = Math.floor(targetData.coins * 0.3);
            const stolen = Math.floor(Math.random() * maxSteal) + 1;
            
            targetData.coins = Math.max(0, targetData.coins - stolen);
            userData.coins += stolen;
            ctx.dbService.markDirty();

            await ctx.reply(
                `ꕥ *Robo Exitoso*\n\n` +
                `Robaste ${formatNumber(stolen)} coins a @${target.split('@')[0]}\n` +
                `Tu balance: ${formatNumber(userData.coins)} coins`,
                { mentions: [target] }
            );
        } else {
            const fine = Math.floor(Math.random() * 200) + 50;
            userData.coins = Math.max(0, userData.coins - fine);
            ctx.dbService.markDirty();

            await ctx.reply(
                `ꕤ *Te atraparon!*\n\n` +
                `Intentaste robar a @${target.split('@')[0]} pero te atraparon.\n` +
                `Multa: ${formatNumber(fine)} coins\n` +
                `Tu balance: ${formatNumber(userData.coins)} coins`,
                { mentions: [target] }
            );
        }
    }
};
