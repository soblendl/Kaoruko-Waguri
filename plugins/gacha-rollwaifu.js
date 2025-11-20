export default {
    commands: ['rollwaifu', 'rw'],
    
    async execute(ctx) {
        const gachaService = ctx.gachaService;
        const character = gachaService.getRandom();

        if (!character) {
            return await ctx.reply('ꕤ No hay personajes disponibles.');
        }

        const rarity = Math.floor(parseInt(character.value || 0) / 400);
        const stars = 'ꕤ'.repeat(Math.min(rarity, 5));

        let message = `ꕥ *Roll de Waifu*\n\n`;
        message += `ꕤ ${character.name}\n`;
        message += `ꕤ ${character.source || 'Desconocido'}\n`;
        message += `${stars} Valor: ${character.value}\n`;
        message += `🆔 ID: ${character.id}\n\n`;
        message += `Usa #claim para reclamar personajes`;

        if (character.img && character.img.length > 0) {
            try {
                await ctx.replyWithImage(character.img[0], { caption: message });
            } catch {
                await ctx.reply(message);
            }
        } else {
            await ctx.reply(message);
        }
    }
};
