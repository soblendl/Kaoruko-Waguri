
import { formatNumber } from '../lib/utils.js';

export default {
    commands: ['balance', 'bal', 'saldo'],

    async execute(ctx) {
        const userData = ctx.dbService.getUser(ctx.sender);

        await ctx.reply(
            `ꕥ *Balance de ${userData.name || 'Usuario'}*\n\n` +
            `💰 Billetera: ${userData.coins || 0} coins\n` +
            `🏦 Banco: ${userData.bank || 0} coins\n` +
            `💎 Total: ${(userData.coins || 0) + (userData.bank || 0)} coins`
        );
    }
};
