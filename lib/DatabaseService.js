import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseService {
    constructor(dbFilePath = path.join(__dirname, '../database/db.data')) {
        this.dbPath = dbFilePath;
        this.db = {
            users: {},
            groups: {},
            waifus: {},
            economy: {},
            gacha: {},
            cooldowns: {}
        };
        this.saveInterval = null;
        this.isDirty = false;
    }

    load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf-8');
                this.db = JSON.parse(data);
                console.log('✅ Base de datos cargada en RAM');
            } else {
                console.log('✨ Base de datos inicializada');
                this.save();
            }
        } catch (error) {
            console.error('❌ Error cargando base de datos:', error.message);
            console.log('🔄 Usando base de datos vacía');
        }

        this.startAutoSave();
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
        process.on('exit', () => this.saveSync());

        return this.db;
    }

    save() {
        if (!this.isDirty) return;

        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf-8');
            this.isDirty = false;
        } catch (error) {
            console.error('❌ Error guardando base de datos:', error.message);
        }
    }

    saveSync() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf-8');
        } catch (error) {
            console.error('❌ Error en guardado síncrono:', error.message);
        }
    }

    startAutoSave() {
        let lastChange = 0;

        this.saveInterval = setInterval(() => {
            if (this.isDirty) {
                const now = Date.now();
                if (now - lastChange >= 60000) {
                    this.save();
                    lastChange = now;
                }
            }
        }, 10000);
    }

    markDirty() {
        this.isDirty = true;
    }

    gracefulShutdown() {
        console.log('\n🛑 Cerrando bot...');
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        this.saveSync();
        console.log('💾 Base de datos guardada');
        process.exit(0);
    }

    get(key) {
        return this.db[key];
    }

    set(key, value) {
        this.db[key] = value;
        this.markDirty();
    }

    getUser(userId) {
        if (!this.db.users[userId]) {
            this.db.users[userId] = {
                economy: { 
                    coins: 0, 
                    bank: 0, 
                    lastDaily: 0, 
                    lastWork: 0, 
                    lastCrime: 0, 
                    lastSlut: 0 
                },
                gacha: { 
                    characters: [], 
                    lastClaim: 0, 
                    votes: {} 
                },
                stats: { 
                    messages: 0, 
                    commands: 0 
                },
                monedas: 0,
                antirobo: 0,
                desbloqueo: 0
            };
            this.markDirty();
        }
        return this.db.users[userId];
    }

    getGroup(groupId) {
        if (!this.db.groups[groupId]) {
            this.db.groups[groupId] = {
                settings: { 
                    antilink: false, 
                    welcome: false, 
                    economy: true, 
                    porn: false, 
                    alerts: false 
                },
                banned: []
            };
            this.markDirty();
        }
        return this.db.groups[groupId];
    }

    updateUser(userId, data) {
        const user = this.getUser(userId);
        Object.assign(user, data);
        this.markDirty();
    }

    updateGroup(groupId, data) {
        const group = this.getGroup(groupId);
        Object.assign(group, data);
        this.markDirty();
    }
}