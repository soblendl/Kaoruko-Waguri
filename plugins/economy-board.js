import { formatNumber } from '../lib/utils.js';

export default {
    commands: ['board', 'leaderboard', 'top'],

    async execute(ctx) {
        const users = Object.entries(ctx.dbService.db.users || {})
            .map(([id, data]) => ({
                id,
                name: data.name || 'Usuario',
                total: (data.coins || 0) + (data.bank || 0)
            }))
            .filter(u => u.total > 0)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (users.length === 0) {
            return await ctx.reply('ꕤ No hay usuarios con coins aún.');
        }

        let message = 'ꕥ *Top 10 Más Ricos*\n\n';

        users.forEach((user, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            message += `${medal} ${user.name}: 💎 ${user.total} coins\n`;
        });

        await ctx.reply(message);
    }
};