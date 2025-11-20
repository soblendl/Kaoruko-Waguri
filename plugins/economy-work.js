
import { formatNumber, getCooldown, formatTime, getRandom } from '../lib/utils.js';

const JOBS = [
    '👨‍💻 programaste una app',
    '🍕 repartiste pizzas',
    '🚗 trabajaste como conductor',
    '📦 empacaste cajas',
    '☕ serviste café',
    'ꕥ diseñaste logos',
    'ꕥ escribiste artículos',
    '🎵 tocaste música en la calle',
    '🌱 trabajaste en el jardín',
    'ꕥ reparaste electrodomésticos'
];

export default {
    commands: ['work', 'w'],
    
    async execute(ctx) {
        if (ctx.isGroup && !ctx.dbService.getGroup(ctx.chatId).settings.economy) {
            return await ctx.reply('ꕤ El sistema de economía está desactivado en este grupo.');
        }

        const COOLDOWN = 1 * 60 * 60 * 1000;
        const REWARD = Math.floor(Math.random() * 300) + 100;

        const userData = ctx.userData;
        const cooldown = getCooldown(userData.economy.lastWork, COOLDOWN);

        if (cooldown > 0) {
            return await ctx.reply(
                `ꕤ Estás cansado, descansa un poco.\nVuelve en: ${formatTime(cooldown)}`
            );
        }

        userData.economy.lastWork = Date.now();
        userData.economy.coins += REWARD;
        ctx.dbService.markDirty();

        const job = getRandom(JOBS);

        await ctx.reply(
            `ꕥ *Trabajo Completado*\n\n` +
            `${job} y ganaste: ${formatNumber(REWARD)} coins ꕥ\n` +
            `Balance actual: ${formatNumber(userData.economy.coins)} coins`
        );
    }
};
