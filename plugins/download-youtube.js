import axios from 'axios';

export default {
    commands: ['youtube', 'yt'],

    async execute(ctx) {
        try {
            if (ctx.args.length === 0) {
                return await ctx.reply(
                    `《✧》 *Uso incorrecto del comando*\n\n` +
                    `Ejemplo:\n` +
                    `✿ #youtube https://youtu.be/xxxxx\n` +
                    `✿ #yt https://www.youtube.com/watch?v=xxxxx`
                );
            }

            const url = ctx.args[0];
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                return await ctx.reply('《✧》 Por favor ingresa un link válido de YouTube.');
            }

            await ctx.reply(
                `Usa:\n` +
                `• #ytmp3 ${url} para audio\n` +
                `• #ytmp4 ${url} para video`
            );

        } catch (error) {
            console.error('Error en comando youtube:', error);
            await ctx.reply(`《✧》 Error al procesar el enlace de YouTube.`);
        }
    }
};