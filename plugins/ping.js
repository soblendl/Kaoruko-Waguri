export default {
    commands: ['ping', 'p'],
    
    async execute(ctx) {
        const start = Date.now();
        await ctx.reply('ꕥ Pong!');
        const end = Date.now();
        const latency = end - start;
        
        await ctx.reply(
            `ꕥ *Velocidad del Bot*\n\n` +
            `ꕥ Latencia: ${latency}ms\n` +
            `ꕥ Estado: Online ꕥ`
        );
    }
};
