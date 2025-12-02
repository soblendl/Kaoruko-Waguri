import { fileURLToPath } from 'url';
import path from 'path';

export class MessageHandler {
    constructor(dbService, gachaService, streamManager, queueManager, cacheManager) {
        this.dbService = dbService;
        this.gachaService = gachaService;
        this.streamManager = streamManager;
        this.queueManager = queueManager;
        this.cacheManager = cacheManager;
        this.PREFIX = '#';
    }

    async handleMessage(bot, m) {
        try {
            // Skip own messages
            if (!m.message || m.key.fromMe) {
                return;
            }

            const chatId = m.key.remoteJid;
            let sender = m.key.participant || m.key.remoteJid;

            // Convert LID to normal JID if needed
            if (sender.includes('@lid')) {
                const lidMatch = sender.match(/^(\d+)/);
                if (lidMatch) {
                    const lidNumber = lidMatch[1];
                    sender = `${lidNumber}@s.whatsapp.net`;
                }
            }

            const isGroup = chatId.endsWith('@g.us');

            // Extract text
            const messageType = Object.keys(m.message)[0];
            let text = '';
            if (messageType === 'conversation') {
                text = m.message.conversation;
            } else if (messageType === 'extendedTextMessage') {
                text = m.message.extendedTextMessage?.text || '';
            } else if (messageType === 'imageMessage') {
                text = m.message.imageMessage?.caption || '';
            } else if (messageType === 'videoMessage') {
                text = m.message.videoMessage?.caption || '';
            }

            // Build context
            const ctx = {
                bot: {
                    sendMessage: async (jid, content, options) => {
                        return await bot.ws.sendMessage(jid, content, options);
                    },
                    sock: bot.ws,
                    groupMetadata: async (jid) => {
                        return await bot.ws.groupMetadata(jid);
                    },
                    groupParticipantsUpdate: async (jid, participants, action) => {
                        return await bot.ws.groupParticipantsUpdate(jid, participants, action);
                    }
                },
                msg: m,
                sender: sender,
                chatId: chatId,
                isGroup: isGroup,
                body: text,
                text: text,
                args: [],
                userData: this.dbService.getUser(sender),
                dbService: this.dbService,
                gachaService: this.gachaService,
                streamManager: this.streamManager,
                queueManager: this.queueManager,
                cacheManager: this.cacheManager,
                from: {
                    id: sender,
                    jid: sender,
                    name: m.pushName || 'Usuario'
                },
                reply: async (text, options = {}) => {
                    return await bot.ws.sendMessage(chatId, { text, ...options }, { quoted: m });
                },
                replyWithAudio: async (url, options = {}) => {
                    return await bot.ws.sendMessage(chatId, {
                        audio: { url },
                        mimetype: options.mimetype || 'audio/mpeg',
                        fileName: options.fileName
                    }, { quoted: m });
                },
                replyWithVideo: async (url, options = {}) => {
                    return await bot.ws.sendMessage(chatId, {
                        video: { url },
                        caption: options.caption,
                        fileName: options.fileName
                    }, { quoted: m });
                },
                replyWithImage: async (url, options = {}) => {
                    return await bot.ws.sendMessage(chatId, {
                        image: { url },
                        caption: options.caption
                    }, { quoted: m });
                },
                download: async (message) => {
                    const wapi = await import('@imjxsx/wapi');
                    console.log('--- WAPI Library Exports ---');
                    console.log(wapi);
                    console.log('--------------------------');
                    const { downloadContentFromMessage } = wapi; // This will still error
                    const msg = message || m;
                    const type = Object.keys(msg.message)[0];
                    const stream = await downloadContentFromMessage(msg.message[type], type.replace('Message', ''));
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                },
                prefix: this.PREFIX
            };

            // 1. Run 'before' handlers
            if (global.beforeHandlers) {
                for (const { handler, plugin } of global.beforeHandlers) {
                    try {
                        await handler(ctx);
                    } catch (err) {
                        console.error(`Error in before handler for ${plugin}:`, err);
                    }
                }
            }

            // 2. Process Commands
            const PREFIXES = ['/', '!', '#'];
            const prefix = PREFIXES.find(p => text.startsWith(p));

            if (!text || !prefix) {
                return;
            }

            // Parse command and args
            const args = text.slice(prefix.length).trim().split(/\s+/);
            const commandName = args.shift()?.toLowerCase();
            ctx.args = args;
            ctx.command = commandName;

            if (!commandName) return;

            // Find command
            const commandData = global.commandMap.get(commandName);
            if (!commandData) {
                return;
            }

            // Execute plugin
            await commandData.execute(ctx);

        } catch (error) {
            console.error('ꕤ Error procesando mensaje:', error);
            const chatId = m.key.remoteJid;
            try {
                await bot.ws.sendMessage(chatId, {
                    text: 'ꕤ Ocurrió un error al ejecutar el comando.'
                }, { quoted: m });
            } catch { }
        }
    }
}
