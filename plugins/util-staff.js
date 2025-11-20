const OWNERS = ['5215512345678'];

export default {
    commands: ['staff'],
    
    async execute(ctx) {
        const senderNumber = ctx.from.id.split('@')[0];
        
        if (!OWNERS.includes(senderNumber)) {
            return await ctx.reply('ꕤ Solo los owners del bot pueden usar este comando.');
        }

        await ctx.reply(
            `ꕥ *Llamado de Staff*\n\n` +
            `El owner ha solicitado una reunión del staff.\n` +
            `Todos los administradores deben estar atentos.`
        );
    }
};
