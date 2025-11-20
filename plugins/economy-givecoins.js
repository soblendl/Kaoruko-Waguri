import { extractMentions } from '../lib/utils.js';

export default {
    commands: ['givecoins', 'darcoins'],

    async execute(ctx) {
        if (ctx.args.length < 2) {
            return await ctx.reply('ꕤ Uso: #givecoins <@usuario> <cantidad>');
        }

        const mentions = extractMentions(ctx);
        if (mentions.length === 0) {
            return await ctx.reply('ꕤ Debes mencionar a un usuario.');
        }

        const target = mentions[0];
        const amount = parseInt(ctx.args[1]);

        if (isNaN(amount) || amount <= 0) {
            return await ctx.reply('ꕤ La cantidad debe ser un número mayor a 0.');
        }

        const senderData = ctx.dbService.getUser(ctx.sender);
        if (senderData.coins < amount) {
            return await ctx.reply('ꕤ No tienes suficientes coins.');
        }

        const targetData = ctx.dbService.getUser(target);
        senderData.coins -= amount;
        targetData.coins += amount;
        ctx.dbService.markDirty();

        await ctx.reply(`ꕥ Transferiste ${amount} coins a @${target.split('@')[0]}.`, {
            mentions: [target]
        });
    }
};