import { Bot, LocalAuth } from '@imjxsx/wapi';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Logging function
const logToFile = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    const logPath = path.join(process.cwd(), 'jadibot.log');
    fs.appendFileSync(logPath, logMessage);
    console.log(`[Jadibot] ${message}`);
};

export class JadibotManager {
    constructor() {
        this.subbots = new Map();
        this.codes = new Map();
    }

    generateCode() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    createCode(userId) {
        const code = this.generateCode();
        this.codes.set(code, { userId, createdAt: Date.now() });

        setTimeout(() => {
            this.codes.delete(code);
        }, 5 * 60 * 1000);

        return code;
    }

    async startSubbot(code = null, chatId, mainSock, phoneNumber = null) {
        logToFile(`=== STARTING SUBBOT ===`);
        logToFile(`Code: ${code}, ChatId: ${chatId}, PhoneNumber: ${phoneNumber}`);

        let userId;
        if (code) {
            const codeData = this.codes.get(code);
            if (!codeData) {
                logToFile(`ERROR: Invalid code: ${code}`);
                return { success: false, message: 'ꕤ Código inválido o expirado' };
            }
            userId = codeData.userId;
        } else if (phoneNumber) {
            // Normalize phone number and add WhatsApp suffix
            const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
            userId = `${cleanPhone}@s.whatsapp.net`;
        } else {
            logToFile(`ERROR: Neither code nor phoneNumber provided to start subbot.`);
            return { success: false, message: 'ꕤ Se requiere un código o un número de teléfono para iniciar el sub-bot.' };
        }

        // Extract clean phone number for file system operations
        const cleanUserId = userId.split('@')[0];
        logToFile(`User ID: ${userId}, Clean: ${cleanUserId}`);

        if (this.subbots.has(userId)) {
            logToFile(`ERROR: Subbot already active for ${userId}`);
            return { success: false, message: 'ꕤ Ya tienes un sub-bot activo' };
        }

        try {
            const authPath = path.join(process.cwd(), 'subbots', cleanUserId);
            if (!fs.existsSync(authPath)) {
                fs.mkdirSync(authPath, { recursive: true });
                logToFile(`Created auth directory: ${authPath}`);
            }

            // Generate a valid UUID for the subbot
            const uuid = crypto.randomUUID();
            logToFile(`Generated UUID: ${uuid}`);
            const auth = new LocalAuth(uuid, `subbots/${cleanUserId}`);

            // If using pairing code, set the phone number in account
            const account = phoneNumber
                ? { jid: '', pn: `${phoneNumber}@s.whatsapp.net`, name: '' }
                : { jid: '', pn: '', name: '' };

            const bot = new Bot(uuid, auth, account);
            logToFile(`Bot instance created with account.pn: ${account.pn}`);

            // Setup event listeners before login
            bot.on('qr', async (qr) => {
                logToFile(`QR EVENT FIRED for ${userId}`);
                if (!phoneNumber) {
                    await mainSock.sendMessage(chatId, {
                        image: await QRCode.toBuffer(qr, { scale: 8 }),
                        caption: 'ꕤ Escanea este código QR con WhatsApp\nEl sub-bot se conectará automáticamente'
                    });
                    logToFile(`QR code sent to ${chatId}`);
                }
            });

            bot.on('otp', async (code) => {
                logToFile(`OTP EVENT FIRED! Code: ${code}, phoneNumber: ${phoneNumber}`);
                if (phoneNumber) {
                    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                    logToFile(`Formatted code: ${formattedCode}`);

                    // Send formatted message with instructions
                    await mainSock.sendMessage(chatId, {
                        text: `ꕤ *Tu Código de Vinculación:*\n\n\`${formattedCode}\`\n\n1. Abre WhatsApp en tu celular\n2. Ve a Dispositivos Vinculados > Vincular dispositivo\n3. Toca "Vincular con número de teléfono" abajo\n4. Ingresa este código.`
                    });

                    // Send plain code in second message for easy copying
                    await mainSock.sendMessage(chatId, {
                        text: code
                    });
                    logToFile(`Code messages sent to ${chatId}`);
                } else {
                    logToFile(`Code received but no phoneNumber set`);
                }
            });

            bot.on('open', async (openAccount) => {
                logToFile(`OPEN EVENT FIRED! Account: ${openAccount.name || 'Unknown'}`);
                this.subbots.set(userId, {
                    bot,
                    chatId,
                    authPath
                });

                await mainSock.sendMessage(chatId, {
                    text: `ꕥ Sub-bot conectado exitosamente: ${openAccount.name || 'Usuario'}`
                });

                if (code) this.codes.delete(code);

                this.setupSubbotHandlers(bot, userId, mainSock);
                logToFile(`Subbot handlers configured for ${userId}`);
            });

            bot.on('close', async (reason) => {
                logToFile(`CLOSE EVENT for ${userId}: ${reason}`);
                if (reason === 'logged out') {
                    this.subbots.delete(userId);
                    await mainSock.sendMessage(chatId, { text: 'ꕤ Sub-bot desconectado (Cerró sesión)' });
                }
            });

            bot.on('error', (error) => {
                logToFile(`ERROR EVENT: ${error.message || error}`);
            });

            // Start the bot
            // If phoneNumber is provided, we use pairing code method (otp)
            if (phoneNumber) {
                logToFile(`Requesting OTP code for: ${phoneNumber}`);
                try {
                    const result = await bot.login('otp');
                    logToFile(`Login result: ${JSON.stringify(result)}`);
                } catch (error) {
                    logToFile(`Login error: ${error.message || error}`);
                    return { success: false, message: `ꕤ Error: ${error.message}` };
                }
            } else {
                logToFile(`Using QR login mode`);
                await bot.login('qr');
            }

            logToFile(`Subbot started successfully for ${userId}`);
            return { success: true, message: 'ꕥ Iniciando sub-bot...' };

        } catch (error) {
            logToFile(`FATAL ERROR: ${error.message || error}\n${error.stack}`);
            return { success: false, message: 'ꕤ Error al iniciar sub-bot' };
        }
    }

    setupSubbotHandlers(subBot, userId, mainSock) {
        // We need to access the underlying socket to listen to messages
        // wapi Bot exposes .ws (the socket)
        subBot.ws.ev.on('messages.upsert', async ({ messages }) => {
            const m = messages[0];
            if (!m.message || m.key.fromMe) return;

            // Use the global message handler
            if (global.messageHandler) {
                await global.messageHandler.handleMessage(subBot, m);
            }
        });
    }

    stopSubbot(userId) {
        const subbotData = this.subbots.get(userId);
        if (!subbotData) {
            return { success: false, message: 'ꕤ No tienes un sub-bot activo' };
        }

        try {
            // Close the bot connection
            // wapi Bot doesn't have a direct 'end' or 'logout' method exposed easily in documentation?
            // Assuming we can just kill the socket or if there is a method.
            // Looking at index.js, it seems we just let it be or process.exit. 
            // But for subbot we need to stop just one.

            // Try closing the socket directly
            if (subbotData.bot.ws) {
                subbotData.bot.ws.end(undefined);
            }

            this.subbots.delete(userId);

            return { success: true, message: 'ꕥ Sub-bot detenido' };
        } catch (error) {
            console.error('Error deteniendo subbot:', error);
            return { success: false, message: 'ꕤ Error al detener sub-bot' };
        }
    }

    getSubbots() {
        return Array.from(this.subbots.entries()).map(([userId, data]) => ({
            userId,
            chatId: data.chatId
        }));
    }
}

export const jadibotManager = new JadibotManager();
