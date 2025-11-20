
import { formatNumber, extractMentions } from '../lib/utils.js';

export default {
    commands: ['einfo'],
    
    async execute(ctx) {
        if (ctx.isGroup && !ctx.dbService.getGroup(ctx.chatId).settings.economy) {
            return await ctx.reply('ꕤ El sistema de economía está desactivado en este grupo.');
        }

        const mentions = extractMentions(ctx);
        const target = mentions.length > 0 ? mentions[0] : ctx.sender;

        const userData = ctx.dbService.getUser(target);
        const stats = userData.stats;
        const total = userData.economy.coins + userData.economy.bank;

        const message = `ꕥ *Estadísticas de Economía*\n\n` +
            `Usuario: @${target.split('@')[0]}\n\n` +
            `ꕤ Coins: ${formatNumber(userData.economy.coins)}\n` +
            `ꕥ Banco: ${formatNumber(userData.economy.bank)}\n` +
            `💵 Total: ${formatNumber(total)}\n\n` +
            `📈 Mensajes enviados: ${formatNumber(stats?.messages || 0)}\n` +
            `ꕥ Comandos usados: ${formatNumber(stats?.commands || 0)}`;

        await ctx.reply(message, { mentions: [target] });
    }
};
