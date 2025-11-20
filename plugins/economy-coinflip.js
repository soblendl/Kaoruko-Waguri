import { formatNumber } from '../lib/utils.js';

export default {
    commands: ['coinflip', 'cf'],

    async execute(ctx) {
        if (ctx.args.length < 2) {
            return await ctx.reply('ꕤ Uso: #coinflip <cantidad> <cara/cruz>');
        }

        const amount = parseInt(ctx.args[0]);
        const choice = ctx.args[1].toLowerCase();

        if (isNaN(amount) || amount <= 0) {
            return await ctx.reply('ꕤ La cantidad debe ser un número mayor a 0.');
        }

        if (!['cara', 'cruz'].includes(choice)) {
            return await ctx.reply('ꕤ Debes elegir cara o cruz.');
        }

        const userData = ctx.dbService.getUser(ctx.sender);
        if (userData.coins < amount) {
            return await ctx.reply('ꕤ No tienes suficientes coins.');
        }

        const result = Math.random() < 0.5 ? 'cara' : 'cruz';
        const won = result === choice;

        if (won) {
            userData.coins += amount;
            ctx.dbService.markDirty();
            await ctx.reply(`ꕥ ¡Salió ${result}! Ganaste ${amount} coins.`);
        } else {
            userData.coins -= amount;
            ctx.dbService.markDirty();
            await ctx.reply(`ꕤ Salió ${result}. Perdiste ${amount} coins.`);
        }
    }
};