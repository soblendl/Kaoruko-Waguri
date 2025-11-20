import { loadLinks, getRandomLink, downloadMedia } from '../lib/nsfw.js';

export default {
    commands: ['hbikini'],
    
    async execute(sock, m, { chatId, isGroup }) {
        if (isGroup && !global.db.groups[chatId]?.settings?.porn) {
            return await sock.sendMessage(chatId, { text: 'ꕤ Los comandos NSFW están desactivados en este grupo.' });
        }

        try {
            await sock.sendMessage(chatId, { text: 'ꕤ Cargando imagen hentai bikini...' });
            
            const links = await loadLinks('hentaiSemi');
            if (links.length === 0) {
                return await sock.sendMessage(chatId, { text: 'ꕤ Error al cargar la base de datos de imágenes.' });
            }

            const randomUrl = getRandomLink(links);
            const buffer = await downloadMedia(randomUrl);
            
            if (!buffer) {
                return await sock.sendMessage(chatId, { text: 'ꕤ Error al descargar la imagen.' });
            }

            await sock.sendMessage(chatId, {
                image: buffer,
                caption: 'ꕥ Imagen hentai bikini aleatoria'
            });
        } catch (error) {
            console.error('Error en hbikini:', error);
            await sock.sendMessage(chatId, { text: 'ꕤ Ocurrió un error al procesar la solicitud.' });
        }
    }
};
