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

const logger = pino({ level: 'fatal' })

process.on('uncaughtException', err => console.error(err))
process.on('unhandledRejection', (r, p) => console.error(r))

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

const UUID = '1f1332f4-7c2a-4b88-b4ca-bd56d07ed713'
const sessionDir = 'kaoruko-session'
const auth = new LocalAuth(UUID, sessionDir)

const account = { jid: '', pn: '', name: '' }

const bot = new Bot(UUID, auth, account, { logger })

const pluginsDir = path.join(__dirname, 'plugins')
const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

for (const file of pluginFiles) {
  try {
    const filePath = pathToFileURL(path.join(pluginsDir, file)).href
    const plugin = await import(filePath)
    const data = plugin.default
    if (!data || !data.commands) continue
    if (typeof data.before === 'function') {
      global.beforeHandlers.push({ plugin: file, handler: data.before })
    }
    for (const cmd of data.commands) {
      global.commandMap.set(cmd, { execute: data.execute, plugin: file })
    }
  } catch {}
}

bot.on('qr', async qr => {
  const qrString = await QRCode.toString(qr, { type: 'terminal', small: true })
  console.log(qrString)
})

bot.on('open', account => {
  bot.ws.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      await messageHandler.handleMessage(bot, m)
    }
  })

  bot.ws.ev.on('group-participants.update', async event => {
    await welcomeHandler.handle(bot.ws, event)
  })
})

bot.on('error', err => console.error(err))

const backupDir = path.join(__dirname, 'backup')
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir)

const backupSession = () => {
  const creds = path.join(sessionDir, 'creds.json')
  if (!fs.existsSync(creds)) return
  const name = `creds-${Date.now()}.json`
  fs.copyFileSync(creds, path.join(backupDir, name))
  const files = fs.readdirSync(backupDir).sort()
  while (files.length > 3) {
    fs.unlinkSync(path.join(backupDir, files.shift()))
  }
}

setInterval(async () => {
  if (global.db) await dbService.save()
}, 30000)

setInterval(() => {
  backupSession()
}, 300000)

const shutdown = async () => {
  await dbService.gracefulShutdown()
  await gachaService.gracefulShutdown()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

await bot.login('qr')
