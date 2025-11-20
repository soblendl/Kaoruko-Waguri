export default {
    commands: ['harem', 'miswaifu', 'coleccion'],
    
    async execute(ctx) {
        const userData = ctx.userData;
        const gachaService = ctx.gachaService;
        const userCharacters = gachaService.getByUser(ctx.sender);

        if (userCharacters.length === 0) {
            return await ctx.reply('ꕤ No tienes personajes aún.\nUsa #claim para obtener uno.');
        }

        let message = `ꕥ *Tu Harem* (${userCharacters.length} personajes)\n\n`;
        
        const displayLimit = 25;
        const charactersToShow = userCharacters.slice(0, displayLimit);
        
        charactersToShow.forEach((char, i) => {
            const rarity = Math.floor(parseInt(char.value || 0) / 400);
            const stars = 'ꕤ'.repeat(Math.min(rarity, 5));
            message += `${i + 1}. ${char.name}\n`;
            message += `   📺 ${char.source || 'Desconocido'}\n`;
            message += `   ${stars} Valor: ${char.value}\n`;
            message += `   🆔 ID: ${char.id}\n\n`;
        });

        if (userCharacters.length > displayLimit) {
            message += `... y ${userCharacters.length - displayLimit} más\n\n`;
        }

        const totalValue = userCharacters.reduce((sum, char) => sum + parseInt(char.value || 0), 0);
        message += `💰 Valor total: ${totalValue.toLocaleString()}`;

        await ctx.reply(message);
    }
};
