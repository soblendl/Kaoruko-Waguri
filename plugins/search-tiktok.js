
import axios from 'axios'
import * as baileys from '@whiskeysockets/baileys'

const tiktokSearchCommand = {
    name: 'tiktoksearch',
    aliases: ['tts', 'tiktoks'],
    category: 'search',
    description: 'Busca videos en TikTok',
    usage: '#tiktoksearch <texto>',
    adminOnly: false,
    groupOnly: false,
    botAdminRequired: false,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid
        const dev = 'DeltaByte'
        
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "《✧》 Por favor, ingrese un texto para buscar en TikTok.\n\n" +
                    "Ejemplo: #tiktoksearch gatos graciosos"
            }, { quoted: msg })
        }
        
        const text = args.join(' ')
        
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]
            }
        }
        
        try {
            let { data } = await axios.get(
                `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`
            )
            
            if (!data || !data.data || data.data.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: "《✧》 No se encontraron resultados para: " + text
                }, { quoted: msg })
            }
            
            let searchResults = data.data
            shuffleArray(searchResults)
            let topResults = searchResults.splice(0, 7)
            
            const cards = []
            for (let result of topResults) {
                try {
                    const videoMsg = await sock.sendMessage(sock.user.id, {
                        video: { url: result.nowm }
                    })
                    
                    if (videoMsg?.message?.videoMessage) {
                        const card = {
                            body: baileys.proto.Message.InteractiveMessage.Body.fromObject({ 
                                text: null 
                            }),
                            footer: baileys.proto.Message.InteractiveMessage.Footer.fromObject({ 
                                text: dev 
                            }),
                            header: baileys.proto.Message.InteractiveMessage.Header.fromObject({
                                title: result.title || 'Video de TikTok',
                                hasMediaAttachment: true,
                                videoMessage: videoMsg.message.videoMessage
                            }),
                            nativeFlowMessage: baileys.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
                                buttons: [] 
                            })
                        }
                        cards.push(card)
                    }
                } catch (cardError) {
                    console.error('Error creando tarjeta:', cardError.message)
                }
            }
            
            if (cards.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: "《✧》 No se pudieron procesar los videos encontrados."
                }, { quoted: msg })
            }
            
            try {
                const carouselMessage = baileys.generateWAMessageFromContent(chatId, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: baileys.proto.Message.InteractiveMessage.fromObject({
                                body: baileys.proto.Message.InteractiveMessage.Body.create({
                                    text: "📱 RESULTADO DE: " + text
                                }),
                                footer: baileys.proto.Message.InteractiveMessage.Footer.create({
                                    text: dev
                                }),
                                header: baileys.proto.Message.InteractiveMessage.Header.create({
                                    hasMediaAttachment: false
                                }),
                                carouselMessage: baileys.proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                    cards: cards
                                })
                            })
                        }
                    }
                }, { quoted: msg })

                await sock.relayMessage(chatId, carouselMessage.message, {
                    messageId: carouselMessage.key.id
                })
            } catch (carouselError) {
                console.error('Error enviando carousel:', carouselError)
                for (let i = 0; i < topResults.length; i++) {
                    const result = topResults[i]
                    try {
                        await sock.sendMessage(chatId, {
                            video: { url: result.nowm },
                            caption: `📹 *Video ${i + 1}/${topResults.length}*\n\n📝 ${result.title}\n\n${dev}`
                        }, { quoted: msg })
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    } catch (e) {
                        console.error(`Error enviando video ${i + 1}:`, e.message)
                    }
                }
            }
        } catch (error) {
            console.error('Error en tiktoksearch:', error)
            await sock.sendMessage(chatId, {
                text: `《✧》 *OCURRIÓ UN ERROR:* ${error.message}`
            }, { quoted: msg })
        }
    }
}

export default tiktokSearchCommand
