
import wiki from 'wikijs'

const fandomCommand = {
    name: 'fandom',
    aliases: ['wikif'],
    category: 'search',
    description: 'Busca información en Fandom.com',
    usage: '#fandom [término]',
    adminOnly: false,
    groupOnly: false,
    botAdminRequired: false,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid
        
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `《✧》 *Uso incorrecto del comando*\n\n` +
                    `*Ejemplos:*\n` +
                    `✿ #fandom Naruto\n` +
                    `✿ #wikif Minecraft\n` +
                    `✿ #fandom League of Legends`
            })
        }

        const query = args.join(' ')
        
        try {
            const page = await wiki({ apiUrl: 'https://community.fandom.com/api.php' }).page(query)
            const summary = await page.summary()
            const images = await page.images()
            
            const image = images.find(img => img.endsWith('.jpg') || img.endsWith('.png') || img.endsWith('.jpeg'))
            
            const extract = summary.length > 1500 ? summary.slice(0, 1500) + '...' : summary
            
            const caption = `《✧》 *Fandom Wiki*\n\n` +
                `📚 *Título:* ${page.raw.title}\n\n` +
                `${extract}\n\n` +
                `─────────────────\n` +
                `_Información de Fandom_`

            if (image) {
                await sock.sendMessage(chatId, {
                    image: { url: image },
                    caption: caption
                })
            } else {
                await sock.sendMessage(chatId, {
                    text: caption
                })
            }
            
        } catch (error) {
            console.error('Error en comando fandom:', error)
            await sock.sendMessage(chatId, { 
                text: `《✧》 No se encontró información para: "${query}"\n\n` +
                    `💡 *Tip:* Intenta con términos en inglés o verifica la ortografía.`
            })
        }
    }
}

export default fandomCommand
