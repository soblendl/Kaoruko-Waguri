
import axios from 'axios'

const wikipediaCommand = {
    name: 'wikipedia',
    aliases: ['wiki', 'wp'],
    category: 'search',
    description: 'Busca información en Wikipedia',
    usage: '#wikipedia [texto a buscar]',
    adminOnly: false,
    groupOnly: false,
    botAdminRequired: false,
    
    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid
        
        try {
            if (args.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `《✧》 *Uso incorrecto del comando*\n\n` +
                        `*Ejemplos:*\n` +
                        `✿ #wikipedia inteligencia artificial\n` +
                        `✿ #wiki Albert Einstein\n` +
                        `✿ #wp Colombia`
                }, { quoted: msg })
            }
            
            const query = args.join(' ')

            const searchUrl = `https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`
            const searchResponse = await axios.get(searchUrl)
            const [, titles, , urls] = searchResponse.data
            
            if (!titles || titles.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `《✧》 No se encontraron resultados en Wikipedia para: "${query}"\n\n` +
                        `💡 *Tip:* Intenta con otros términos de búsqueda.`
                }, { quoted: msg })
            }

            const title = titles[0]
            const pageUrl = urls[0]
            const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
            const summaryResponse = await axios.get(summaryUrl)
            const pageData = summaryResponse.data
            
            let responseText = `《✧》 *Wikipedia*\n\n`
            responseText += `📚 *Título:* ${pageData.title}\n\n`
            
            const extract = pageData.extract.length > 500
                ? pageData.extract.substring(0, 500) + '...'
                : pageData.extract
                
            responseText += `${extract}\n\n`
            responseText += `🔗 *Leer más:* ${pageUrl}\n`
            responseText += `─────────────────\n`
            responseText += `_Información de Wikipedia_`
            
            const imageUrl = pageData.originalimage?.source || pageData.thumbnail?.source || null
            
            if (imageUrl) {
                try {
                    await sock.sendMessage(chatId, {
                        image: { url: imageUrl },
                        caption: responseText
                    }, { quoted: msg })
                } catch (imgError) {
                    await sock.sendMessage(chatId, {
                        text: responseText
                    }, { quoted: msg })
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: responseText
                }, { quoted: msg })
            }
            
        } catch (error) {
            console.error('Error en comando wikipedia:', error)
            await sock.sendMessage(chatId, {
                text: `《✧》 Error al buscar en Wikipedia.\n\n💡 *Tip:* Verifica la ortografía o usa términos más específicos.`
            }, { quoted: msg })
        }
    }
}

export default wikipediaCommand
