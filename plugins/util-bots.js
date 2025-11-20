export default {
    commands: ['bots', 'sockets'],
    
    async execute(ctx) {
        await ctx.reply(
            `ꕥ *Estado de Bots*\n\n` +
            `ꕥ Bots activos: 1\n` +
            `ꕥ Estado: Online\n` +
            `ꕥ Uptime: Activo`
        );
    }
};
