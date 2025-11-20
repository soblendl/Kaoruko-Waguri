import { formatNumber, getCooldown, formatTime } from '../lib/utils.js';

export default {
    commands: ['daily', 'diario'],

    async execute(ctx) {
        const userData = ctx.dbService.getUser(ctx.sender);
        const now = Date.now();
        const cooldown = 86400000; // 24 horas

        if (now - (userData.lastDaily || 0) < cooldown) {
            const timeLeft = Math.round((cooldown - (now - userData.lastDaily)) / 3600000);
            return await ctx.reply(`ꕤ Ya reclamaste tu recompensa diaria. Vuelve en ${timeLeft} horas.`);
        }

        const reward = 1000;
        userData.coins += reward;
        userData.lastDaily = now;
        ctx.dbService.markDirty();

        await ctx.reply(`ꕥ ¡Recompensa diaria reclamada! +${reward} coins`);
    }
};