export default {
    commands: ['sell', 'vender'],
    
    async execute(ctx) {
        if (ctx.isGroup && !ctx.dbService.getGroup(ctx.chatId).settings.economy) {
            return await ctx.reply('ꕤ El sistema de economía está desactivado en este grupo.');
        }

        if (ctx.args.length < 1) {
            return await ctx.reply('ꕤ Uso: #sell <id_personaje>');
        }

        const characterId = ctx.args[0];
        const gachaService = ctx.gachaService;
        const character = gachaService.getById(characterId);

        if (!character) {
            return await ctx.reply(`ꕤ No se encontró ningún personaje con el ID: *${characterId}*`);
        }

        if (character.user !== ctx.sender) {
            return await ctx.reply('ꕤ Este personaje no te pertenece.');
        }

        const sellPrice = parseInt(character.value) || 1000;
        const userData = ctx.userData;

        try {
            gachaService.releaseCharacter(characterId);

            const charIndex = userData.gacha.characters.findIndex(c => c.id === characterId);
            if (charIndex !== -1) {
                userData.gacha.characters.splice(charIndex, 1);
            }

            userData.economy.coins += sellPrice;
            ctx.dbService.markDirty();

            await ctx.reply(
                `ꕤ *Venta Exitosa*\n\n` +
                `Vendiste a *${character.name}* por *${sellPrice.toLocaleString()}* coins\n` +
                `Balance: ${userData.economy.coins.toLocaleString()} coins`
            );
        } catch (error) {
            await ctx.reply(`ꕤ Error: ${error.message}`);
        }
    }
};
