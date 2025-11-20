
import { formatNumber } from '../lib/utils.js';

export default {
    commands: ['roulette', 'rt'],
    
    async execute(ctx) {
        if (ctx.isGroup && !ctx.dbService.getGroup(ctx.chatId).settings.economy) {
            return await ctx.reply('ꕤ El sistema de economía está desactivado en este grupo.');
        }

        const userData = ctx.userData.economy;
        
        if (!ctx.args[0] || !ctx.args[1]) {
            return await ctx.reply('ꕤ Uso incorrecto.\nUso: #roulette <red/black> <cantidad>');
        }

        const choice = ctx.args[0].toLowerCase();
        const amount = parseInt(ctx.args[1]);

        if (!['red', 'black'].includes(choice)) {
            return await ctx.reply('ꕤ Debes elegir: red o black');
        }

        if (isNaN(amount) || amount <= 0) {
            return await ctx.reply('ꕤ Cantidad inválida.');
        }

        if (amount > userData.coins) {
            return await ctx.reply('ꕤ No tienes suficientes coins.');
        }

        const result = Math.random() < 0.5 ? 'red' : 'black';
        const won = result === choice;

        if (won) {
            const winAmount = Math.floor(amount * 1.8);
            userData.coins += winAmount;
            ctx.dbService.markDirty();
            await ctx.reply(
                `ꕥ *¡Ganaste!*\n\n` +
                `Salió: ${result} ${result === 'red' ? '🔴' : '⚫'}\n` +
                `Ganancia: +${formatNumber(winAmount)} coins\n` +
                `Balance: ${formatNumber(userData.coins)} coins`
            );
        } else {
            userData.coins -= amount;
            ctx.dbService.markDirty();
            await ctx.reply(
                `ꕥ *Perdiste*\n\n` +
                `Salió: ${result} ${result === 'red' ? '🔴' : '⚫'}\n` +
                `Pérdida: -${formatNumber(amount)} coins\n` +
                `Balance: ${formatNumber(userData.coins)} coins`
            );
        }
    }
};
