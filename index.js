process.env.LOG_LEVEL = 'error'
process.env.DEBUG = ''

import QRCode from 'qrcode'
import { Bot, LocalAuth } from '@imjxsx/wapi'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import DatabaseService from './lib/DatabaseService.js'
import GachaService from './lib/GachaService.js'
import StreamManager from './lib/StreamManager.js'
import QueueManager from './lib/QueueManager.js'
import CacheManager from './lib/CacheManager.js'
import TokenService from './lib/TokenService.js'
import PrembotManager from './lib/PrembotManager.js'
import { ShopService } from './lib/ShopService.js'
import { LevelService } from './lib/LevelService.js'
import { MessageHandler } from './lib/MessageHandler.js'
import { WelcomeHandler } from './lib/WelcomeHandler.js'
import { setupCommandWorker } from './workers/commandWorker.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbService = new DatabaseService()
const gachaService = new GachaService()
const streamManager = new StreamManager()
const queueManager = new QueueManager()
const cacheManager = new CacheManager()
const tokenService = new TokenService()
const prembotManager = new PrembotManager(tokenService)
const shopService = new ShopService(dbService)
const levelService = new LevelService(dbService)

await dbService.load()
await gachaService.load()
await tokenService.load()

global.dbService = dbService
global.gachaService = gachaService
global.streamManager = streamManager
global.queueManager = queueManager
global.cacheManager = cacheManager
global.tokenService = tokenService
global.prembotManager = prembotManager
global.shopService = shopService
global.levelService = levelService
global.commandMap = new Map()
global.beforeHandlers = []

const messageHandler = new MessageHandler(
  dbService,
  gachaService,
  streamManager,
  queueManager,
  cacheManager,
  shopService,
  levelService
)

const welcomeHandler = new WelcomeHandler(dbService)

const UUID = '1f1332f4-7c2a-4b88-b4ca-bd56d07ed713'
const auth = new LocalAuth(UUID, 'sessions')
const account = { jid: '', pn: '', name: '' }

const bot = new Bot(UUID, auth, account)

const pluginsDir = path.join(__dirname, 'plugins')
const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

for (const file of pluginFiles) {
  const filePath = pathToFileURL(path.join(pluginsDir, file)).href
  const plugin = await import(filePath)
  const p = plugin.default
  if (!p || typeof p.execute !== 'function' || !Array.isArray(p.commands)) continue
  if (typeof p.before === 'function') {
    global.beforeHandlers.push({ plugin: file, handler: p.before })
  }
  for (const cmd of p.commands) {
    global.commandMap.set(cmd.toLowerCase().trim(), {
      execute: p.execute,
      plugin: file
    })
  }
}

bot.on('qr', async qr => {
  console.clear()
  const qrText = await QRCode.toString(qr, {
    type: 'terminal',
    small: true
  })
  console.log(qrText)
})

bot.on('open', () => {
  const sock = bot.sock
  if (!sock) return

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      messageHandler.handleMessage(bot, m).catch(() => {})
    }
  })

  sock.ev.on('group-participants.update', async event => {
    welcomeHandler.handle(bot, event).catch(() => {})
  })
})

setupCommandWorker(bot, {
  dbService,
  gachaService,
  streamManager,
  queueManager,
  cacheManager,
  tokenService,
  prembotManager,
  shopService,
  levelService
})

await bot.login('qr')
