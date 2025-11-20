import { formatNumber, getCooldown, formatTime, getRandom } from '../lib/utils.js';

const ACTIVITIES = [
    '💃 bailaste en el club',
    '🎭 actuaste en un show',
    '📸 posaste para fotos',
    '🎤 cantaste en un bar',
    '👗 modelaste ropa',
    '🍷 acompañaste a alguien a cenar'
];

export default {
    commands: ['slut'],
    
    async execute(ctx) {
        if (ctx.isGroup && !ctx.dbService.getGroup(ctx.chatId).settings.economy) {
            return await ctx.reply('ꕤ El sistema de economía está desactivado en este grupo.');
        }

        const COOLDOWN = 1.5 * 60 * 60 * 1000;
        const REWARD = Math.floor(Math.random() * 400) + 150;

        const userData = ctx.userData;
        const cooldown = getCooldown(userData.economy.lastSlut, COOLDOWN);

        if (cooldown > 0) {
            return await ctx.reply(`ꕤ Necesitas descansar.\nVuelve en: ${formatTime(cooldown)}`);
        }

        userData.economy.lastSlut = Date.now();
        userData.economy.coins += REWARD;
        ctx.dbService.markDirty();

        const activity = getRandom(ACTIVITIES);

        await ctx.reply(
            `ꕥ *Trabajo Dudoso*\n\n` +
            `${activity} y ganaste: ${formatNumber(REWARD)} coins ꕥ\n` +
            `Balance actual: ${formatNumber(userData.economy.coins)} coins`
        );
    }
};