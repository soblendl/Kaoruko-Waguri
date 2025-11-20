import { loadLinks, getRandomLink, downloadMedia } from '../lib/nsfw.js';

export default {
    commands: ['pornvideo', 'pv'],
    
    async execute(sock, m, { chatId, isGroup }) {
        if (isGroup && !global.db.groups[chatId]?.settings?.porn) {
            return await sock.sendMessage(chatId, { text: 'ꕤ Los comandos NSFW están desactivados en este grupo.' });
        }

        try {
            await sock.sendMessage(chatId, { text: 'ꕤ Cargando video, esto puede tardar...' });
            
            const links = await loadLinks('porno');
            if (links.length === 0) {
                return await sock.sendMessage(chatId, { text: 'ꕤ Error al cargar la base de datos de videos.' });
            }

            const randomUrl = getRandomLink(links);
            const buffer = await downloadMedia(randomUrl);
            
            if (!buffer) {
                return await sock.sendMessage(chatId, { text: 'ꕤ Error al descargar el video.' });
            }

            await sock.sendMessage(chatId, {
                video: buffer,
                caption: 'ꕥ Video aleatorio'
            });
        } catch (error) {
            console.error('Error en pornvideo:', error);
            await sock.sendMessage(chatId, { text: 'ꕤ Ocurrió un error al procesar la solicitud.' });
        }
    }
};
