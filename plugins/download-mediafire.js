
import axios from 'axios';

export default {
    commands: ['mediafire', 'mf', 'mfdl'],
    
    async execute(ctx) {
        try {
            if (ctx.args.length === 0) {
                return await ctx.reply(
                    `《✧》 *Uso incorrecto del comando*\n\n` +
                    `Ejemplo:\n` +
                    `✿ #mediafire https://www.mediafire.com/file/xxxxx`
                );
            }

            const url = ctx.args[0];
            if (!url.includes('mediafire.com')) {
                return await ctx.reply('《✧》 Por favor ingresa un link válido de MediaFire.');
            }

            const apiUrl = `https://delirius-apiofc.vercel.app/download/mediafire?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });
            const data = response.data;

            if (!data || !data.data || !data.data[0]) {
                return await ctx.reply('《✧》 No se pudo obtener información del enlace.');
            }

            const file = data.data[0];
            if (!file.link) {
                return await ctx.reply('《✧》 No se pudo obtener el enlace de descarga.');
            }

            const caption = `╔═══《 MEDIAFIRE 》═══╗\n` +
                `║\n` +
                `║ ✦ *Nombre:* ${file.nama || 'Desconocido'}\n` +
                `║ ✦ *Peso:* ${file.size || 'N/A'}\n` +
                `║ ✦ *Tipo:* ${file.mime || 'N/A'}\n` +
                `║\n` +
                `╚═════════════════╝`;

            const fileResponse = await axios.get(file.link, {
                responseType: 'arraybuffer',
                timeout: 60000,
                maxContentLength: 100 * 1024 * 1024
            });

            const buffer = Buffer.from(fileResponse.data);

            if (file.mime?.includes('image')) {
                await ctx.replyWithImage(buffer, {
                    caption: caption,
                    fileName: file.nama || 'archivo'
                });
            } else if (file.mime?.includes('video')) {
                await ctx.replyWithVideo(buffer, {
                    caption: caption,
                    fileName: file.nama || 'video.mp4'
                });
            } else if (file.mime?.includes('audio')) {
                await ctx.replyWithAudio(buffer, {
                    caption: caption,
                    fileName: file.nama || 'audio.mp3'
                });
            } else {
                await ctx.replyWithDocument(buffer, {
                    caption: caption,
                    fileName: file.nama || 'archivo',
                    mimetype: file.mime || 'application/octet-stream'
                });
            }

        } catch (error) {
            console.error('Error en comando mediafire:', error);
            await ctx.reply(
                `《✧》 Error al procesar el enlace de MediaFire.\n\n💡 *Tip:* Asegúrate de que el enlace de MediaFire sea válido y público.`
            );
        }
    }
};
