import { formatNumber } from '../lib/utils.js';

export default {
    commands: ['deposit', 'dep', 'depositar'],

    async execute(ctx) {
        if (ctx.args.length === 0) {
            return await ctx.reply('ꕤ Uso: #deposit <cantidad|all>');
        }

        const userData = ctx.dbService.getUser(ctx.sender);

        let amount;
        if (ctx.args[0].toLowerCase() === 'all') {
            amount = userData.coins;
        } else {
            amount = parseInt(ctx.args[0]);
        }

        if (isNaN(amount) || amount <= 0) {
            return await ctx.reply('ꕤ La cantidad debe ser un número mayor a 0.');
        }

        if (userData.coins < amount) {
            return await ctx.reply('ꕤ No tienes suficientes coins en tu billetera.');
        }

        userData.coins -= amount;
        userData.bank = (userData.bank || 0) + amount;
        ctx.dbService.markDirty();

        await ctx.reply(`ꕥ Depositaste ${amount} coins en el banco.`);
    }
};