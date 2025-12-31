import { Bot, LocalAuth } from '@imjxsx/wapi';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import DatabaseService from './lib/DatabaseService.js';
import GachaService from './lib/GachaService.js';
import StreamManager from './lib/StreamManager.js';
import QueueManager from './lib/QueueManager.js';
import CacheManager from './lib/CacheManager.js';
import TokenService from './lib/TokenService.js';
import PrembotManager from './lib/PrembotManager.js';
import { ShopService } from './lib/ShopService.js';
import { LevelService } from './lib/LevelService.js';
import { MessageHandler } from './lib/MessageHandler.js';
import { WelcomeHandler } from './lib/WelcomeHandler.js';
import { setupCommandWorker } from './workers/commandWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Global Error Handlers ---
process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// --- Services Initialization ---
const dbService = new DatabaseService();
const gachaService = new GachaService();
const streamManager = new StreamManager();
const queueManager = new QueueManager();
const cacheManager = new CacheManager();
const tokenService = new TokenService();
const prembotManager = new PrembotManager(tokenService);
const shopService = new ShopService(dbService);
const levelService = new LevelService(dbService);

global.db = await dbService.load();
global.dbService = dbService;
global.gachaService = gachaService;
global.streamManager = streamManager;
global.queueManager = queueManager;
global.cacheManager = cacheManager;
global.tokenService = tokenService;
global.prembotManager = prembotManager;
global.shopService = shopService;
global.levelService = levelService;
global.commandMap = new Map();
global.beforeHandlers = [];

// Initialize Handlers
const messageHandler = new MessageHandler(dbService, gachaService, streamManager, queueManager, cacheManager, shopService, levelService);
const welcomeHandler = new WelcomeHandler(dbService);
global.messageHandler = messageHandler;

await gachaService.load();
await tokenService.load();

// --- Bot Configuration (LocalAuth) ---
const UUID = '1f1332f4-7c2a-4b88-b4ca-bd56d07ed713';
const auth = new LocalAuth(UUID, 'sessions');
const account = { jid: '', pn: '', name: '' };
const OWNER_JID = '573115434166@s.whatsapp.net';
const PREFIX = '#';

const bot = new Bot(UUID, auth, account);

// --- Plugin Loader ---
const pluginsDir = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

console.log(`ꕤ Cargando ${pluginFiles.length} plugins...`);

for (const file of pluginFiles) {
    try {
        const filePath = pathToFileURL(path.join(pluginsDir, file)).href;
        const plugin = await import(filePath);
        const pluginExport = plugin.default;

        if (pluginExport && pluginExport.commands) {
            // Optimization: Store before handler separately
            if (pluginExport.before && typeof pluginExport.before === 'function') {
                global.beforeHandlers.push({
                    plugin: file,
                    handler: pluginExport.before
                });
            }

            for (const cmd of pluginExport.commands) {
                global.commandMap.set(cmd, {
                    execute: pluginExport.execute,
                    plugin: file
                });
            }
            console.log(`ꕥ Plugin cargado: ${file}`);
        }
    } catch (error) {
        console.error(`ꕤ Error cargando plugin ${file}:`, error.message);
    }
}

// --- Event Handlers ---
console.log('📌 Registrando event handlers...');

bot.on('qr', async (qr) => {
    console.log('\n✨ Escanea este código QR con WhatsApp ✨\n');
    const qrString = await QRCode.toString(qr, { type: 'terminal', small: true });
    console.log(qrString);
});

bot.on('open', (account) => {
    console.log('🎉 EVENTO OPEN DISPARADO!');
    console.log('✅ Conexión exitosa!');
    console.log(`📱 Bot conectado: ${account.name || 'Kaoruko Waguri'}`);

    // Message Handler - Fire-and-forget (no blocking await)
    bot.ws.ev.on('messages.upsert', ({ messages, type }) => {
        for (const m of messages) {
            // Process without blocking - errors caught internally
            messageHandler.handleMessage(bot, m).catch(err => {
                console.error('Error processing message:', err);
            });
        }
    });

    // Group Participants Handler - Fire-and-forget
    bot.ws.ev.on('group-participants.update', (event) => {
        welcomeHandler.handle(bot, event).catch(err => {
            console.error('Error in welcome handler:', err);
        });
    });
});

// --- Connection Events (no manual reconnection - library handles it) ---
bot.on('close', (reason) => {
    console.log('⚠️ Conexión cerrada:', reason);
    // The @imjxsx/wapi library handles reconnection internally
});

bot.on('error', (err) => {
    console.error('❌ Error del bot:', err);
});

// --- Graceful Shutdown ---
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando gracefully...`);
    await dbService.gracefulShutdown();
    await gachaService.gracefulShutdown();
    await tokenService.gracefulShutdown();
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// --- Start Bot ---
console.log('🚀 Iniciando bot con @imjxsx/wapi...');
await bot.login('qr');

// --- Setup Command Worker ---
const services = {
    dbService,
    gachaService,
    streamManager,
    queueManager,
    cacheManager,
    tokenService,
    prembotManager,
    shopService,
    levelService
};
setupCommandWorker(bot, services);

