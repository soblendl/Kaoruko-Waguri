import { Bot, LocalAuth } from '@imjxsx/wapi'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import pino from 'pino'

import DatabaseService from './lib/DatabaseService.js'
import GachaService from './lib/GachaService.js'
import StreamManager from './lib/StreamManager.js'
import QueueManager from './lib/QueueManager.js'
import CacheManager from './lib/CacheManager.js'
import { MessageHandler } from './lib/MessageHandler.js'
import { WelcomeHandler } from './lib/WelcomeHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─────────────────────────────
// Baileys Silencer (SOLO ERRORES)
// ─────────────────────────────
const logger = pino({
  level: 'fatal'
})

// ─────────────────────────────
// Global Error Handlers
// ─────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason)
})

// ─────────────────────────────
// Services Initialization
// ─────────────────────────────
const dbService = new DatabaseService()
const gachaService = new GachaService()
const streamManager = new StreamManager()
const queueManager = new QueueManager()
const cacheManager = new CacheManager()

global.db = await dbService.load()
global.dbService = dbService
global.gachaService = gachaService
global.streamManager = streamManager
global.queueManager = queueManager
global.cacheManager = cacheManager
global.commandMap = new Map()
global.beforeHandlers = []

// ─────────────────────────────
// Handlers
// ─────────────────────────────
const messageHandler = new MessageHandler(
  dbService,
  gachaService,
  streamManager,
  queueManager,
  cacheManager
)

const welcomeHandler = new WelcomeHandler(dbService)
global.messageHandler = messageHandler

await gachaService.load()

// ─────────────────────────────
// Bot Configuration
// ─────────────────────────────
const UUID = '1f1332f4-7c2a-4b88-b4ca-bd56d07ed713'
const auth = new LocalAuth(UUID, 'kaoruko-session')

const account = {
  jid: '',
  pn: '',
  name: ''
}

const OWNER_JID = '573115434166@s.whatsapp.net'
const PREFIX = '#'

// 👇 Silenciador aplicado aquí
const bot = new Bot(UUID, auth, account, {
  logger
})

// ─────────────────────────────
// Plugin Loader
// ─────────────────────────────
const pluginsDir = path.join(__dirname, 'plugins')
const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

console.log(`ꕤ Cargando ${pluginFiles.length} plugins...`)

for (const file of pluginFiles) {
  try {
    const filePath = pathToFileURL(path.join(pluginsDir, file)).href
    const plugin = await import(filePath)
    const pluginExport = plugin.default

    if (!pluginExport || !pluginExport.commands) continue

    if (typeof pluginExport.before === 'function') {
      global.beforeHandlers.push({
        plugin: file,
        handler: pluginExport.before
      })
    }

    for (const cmd of pluginExport.commands) {
      global.commandMap.set(cmd, {
        execute: pluginExport.execute,
        plugin: file
      })
    }

    console.log(`ꕥ Plugin cargado: ${file}`)
  } catch (err) {
    console.error(`ꕤ Error cargando plugin ${file}:`, err.message)
  }
}

// ─────────────────────────────
// Events
// ─────────────────────────────
console.log('📌 Registrando event handlers...')

bot.on('qr', async (qr) => {
  console.log('\n✨ Escanea este código QR con WhatsApp ✨\n')
  const qrString = await QRCode.toString(qr, {
    type: 'terminal',
    small: true
  })
  console.log(qrString)
})

bot.on('open', (account) => {
  console.log('🎉 EVENTO OPEN DISPARADO!')
  console.log('✅ Conexión exitosa!')
  console.log(`📱 Bot conectado: ${account.name || 'Kaoruko Waguri'}`)

  bot.ws.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      await messageHandler.handleMessage(bot, m)
    }
  })

  bot.ws.ev.on('group-participants.update', async (event) => {
    await welcomeHandler.handle(bot.ws, event)
  })
})

bot.on('close', (reason) => {
  console.log('⚠️ Conexión cerrada:', reason)
})

bot.on('error', (err) => {
  console.error('❌ Error del bot:', err)
})

// ─────────────────────────────
// Graceful Shutdown
// ─────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando correctamente...`)
  await dbService.gracefulShutdown()
  await gachaService.gracefulShutdown()
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// ─────────────────────────────
// Start Bot
// ─────────────────────────────
console.log('🚀 Iniciando bot con @imjxsx/wapi...')
await bot.login('qr')
