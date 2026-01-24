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
import { AlertHandler } from './lib/AlertHandler.js';
import { setupCommandWorker } from './workers/commandWorker.js';
import memoryManager from './lib/MemoryManager.js';
import { jadibotManager } from './lib/jadibot.js';
import * as SafeDownloader from './lib/SafeDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});
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
global.memoryManager = memoryManager;
global.SafeDownloader = SafeDownloader;
global.commandMap = new Map();
global.beforeHandlers = [];
memoryManager.on('critical', () => {
    console.warn('✿ [System] Memoria crítica detectada - Purgando archivos temporales');
    SafeDownloader.purgeAllTempFiles();
});
memoryManager.on('cleanup', () => {
    SafeDownloader.cleanupTempFiles();
});
SafeDownloader.purgeAllTempFiles();
const messageHandler = new MessageHandler(dbService, gachaService, streamManager, queueManager, cacheManager, shopService, levelService);
const welcomeHandler = new WelcomeHandler(dbService);
const alertHandler = new AlertHandler(dbService);
global.messageHandler = messageHandler;

console.log('ꕤ Loading GachaService...');
await gachaService.load();
console.log('ꕥ GachaService loaded');
console.log('ꕤ Loading TokenService...');
await tokenService.load();
console.log('ꕥ TokenService loaded');
const UUID = '1f1332f4-7c2a-4b88-b4ca-bd56d07ed713';
const auth = new LocalAuth(UUID, 'sessions');
const account = { jid: '', pn: '', name: '' };
const OWNER_JID = '573115434166@s.whatsapp.net';
const PREFIX = '#';
const bot = new Bot(UUID, auth, account);
const pluginsDir = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
console.log(`ꕤ Cargando ${pluginFiles.length} plugins...`);
for (const file of pluginFiles) {
    try {
        const filePath = pathToFileURL(path.join(pluginsDir, file)).href;
        const plugin = await import(filePath);
        const pluginExport = plugin.default;
        if (pluginExport && pluginExport.commands) {
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
console.log('✿ Registrando event handlers...');
bot.on('qr', async (qr) => {
    console.log('\n∘ Escanea este código QR con WhatsApp\n');
    const qrString = await QRCode.toString(qr, { type: 'terminal', small: true });
    console.log(qrString);
});
bot.on('open', (account) => {
    console.log('✿ EVENTO OPEN DISPARADO!');
    console.log('✿ Conexión exitosa!');
    console.log(`✿ Bot conectado » ${account.name || 'Kaoruko Waguri'}`);
    console.log('✿ Iniciando subbots y prembots guardados...');
    prembotManager.loadSessions(bot).catch(e => console.error('Error loading prembots:', e));
    jadibotManager.loadSessions(bot).catch(e => console.error('Error loading subbots:', e));
    bot.ws.ev.on('messages.upsert', ({ messages, type }) => {
        console.log('📨 Mensaje recibido (upsert):', type, messages.length);
        for (const m of messages) {
            messageHandler.handleMessage(bot, m).catch(err => {
                console.error('Error processing message:', err);
            });
        }
    });
    bot.ws.ev.on('group-participants.update', (event) => {
        welcomeHandler.handle(bot, event).catch(err => {
            console.error('Error in welcome handler:', err);
        });
        alertHandler.handle(bot, event).catch(err => {
            console.error('Error in alert handler:', err);
        });
    });
});
bot.on('close', (reason) => {
    console.log('ꕤ Conexión cerrada:', reason);
});
bot.on('error', (err) => {
    console.error('ꕤ Error del bot:', err);
});
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando gracefully...`);
    memoryManager.stop();
    SafeDownloader.cleanupTempFiles();
    await dbService.gracefulShutdown();
    await gachaService.gracefulShutdown();
    await tokenService.gracefulShutdown();
    process.exit(0);
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', async (err) => {
    console.error('ꕤ Uncaught Exception:', err);
    if (err.code === 'ENOSPC' || err.message?.includes('ENOSPC')) {
        console.warn('» ENOSPC detectado en uncaughtException - Purgando temporales...');
        SafeDownloader.purgeAllTempFiles();
        // Evitamos borrar sesiones para no desconectar al bot
        // await import('./lib/SessionCleaner.js').then(m => m.cleanSessionFiles());
        memoryManager?.forceCleanup();
    }
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('ꕤ Unhandled Rejection at:', promise, 'reason:', reason);
    if (reason?.code === 'ENOSPC' || reason?.message?.includes('ENOSPC')) {
        console.warn('» ENOSPC detectado en unhandledRejection - Purgando temporales...');
        SafeDownloader.purgeAllTempFiles();
        // Evitamos borrar sesiones para no desconectar al bot
        // await import('./lib/SessionCleaner.js').then(m => m.cleanSessionFiles());
        memoryManager?.forceCleanup();
    }
});
// import('./lib/SessionCleaner.js').then(m => m.cleanSessionFiles());
console.log('✿ Iniciando bot con @imjxsx/wapi...');
await bot.login('qr');
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