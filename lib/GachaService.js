import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GachaService {
    constructor(charactersFilePath = path.join(__dirname, '../database/characters.json')) {
        this.charactersPath = charactersFilePath;
        this.characters = [];
        this.charactersById = new Map();
        this.isDirty = false;
        this.saveInterval = null;
    }

    load() {
        try {
            if (fs.existsSync(this.charactersPath)) {
                const data = fs.readFileSync(this.charactersPath, 'utf-8');
                this.characters = JSON.parse(data);

                this.indexByGender = new Map();
                this.indexBySource = new Map();

                this.characters.forEach(char => {
                    if (!this.indexByGender.has(char.gender)) {
                        this.indexByGender.set(char.gender, []);
                    }
                    this.indexByGender.get(char.gender).push(char);

                    if (!this.indexBySource.has(char.source)) {
                        this.indexBySource.set(char.source, []);
                    }
                    this.indexBySource.get(char.source).push(char);
                });

                console.log(`✅ Cargados ${this.characters.length} personajes en memoria con índices`);
            } else {
                console.log('⚠️ No se encontró el archivo de personajes');
                this.characters = [];
                this.indexByGender = new Map();
                this.indexBySource = new Map();
            }
        } catch (error) {
            console.error('❌ Error cargando personajes:', error.message);
            this.characters = [];
            this.indexByGender = new Map();
            this.indexBySource = new Map();
        }

        this.startAutoSave();
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
        process.on('exit', () => this.saveSync());
    }

    startAutoSave() {
        this.saveInterval = setInterval(() => {
            if (this.isDirty) {
                this.save();
            }
        }, 60000);
    }

    save() {
        if (!this.isDirty) return;

        try {
            fs.writeFileSync(
                this.charactersPath, 
                JSON.stringify(this.characters, null, 3), 
                'utf-8'
            );
            this.isDirty = false;
        } catch (error) {
            console.error('❌ Error guardando personajes:', error.message);
        }
    }

    saveSync() {
        try {
            fs.writeFileSync(
                this.charactersPath, 
                JSON.stringify(this.characters, null, 3), 
                'utf-8'
            );
        } catch (error) {
            console.error('❌ Error en guardado síncrono de personajes:', error.message);
        }
    }

    shutdown() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        this.saveSync();
    }

    markDirty() {
        this.isDirty = true;
    }

    getAll() {
        return this.characters;
    }

    getById(id) {
        return this.charactersById.get(id);
    }

    getFreeCharacters() {
        return this.characters.filter(c => !c.user || c.user === null || c.status === 'Libre');
    }

    getByUser(userId) {
        return this.characters.filter(c => c.user === userId);
    }

    getRandom() {
        const free = this.getFreeCharacters();
        if (free.length === 0) {
            const index = Math.floor(Math.random() * this.characters.length);
            return this.characters[index];
        }
        const index = Math.floor(Math.random() * free.length);
        return free[index];
    }

    claimCharacter(characterId, userId) {
        const character = this.getById(characterId);
        if (!character) {
            throw new Error('Personaje no encontrado');
        }

        character.user = userId;
        character.status = 'Reclamado';
        this.markDirty();
        return character;
    }

    transferCharacter(characterId, newUserId) {
        const character = this.getById(characterId);
        if (!character) {
            throw new Error('Personaje no encontrado');
        }

        const previousOwner = character.user;
        character.user = newUserId;
        character.status = 'Reclamado';
        this.markDirty();

        return { character, previousOwner };
    }

    releaseCharacter(characterId) {
        const character = this.getById(characterId);
        if (!character) {
            throw new Error('Personaje no encontrado');
        }

        character.user = null;
        character.status = 'Libre';
        this.markDirty();
        return character;
    }

    resetAllCharacters() {
        this.characters.forEach(char => {
            char.user = null;
            char.status = 'Libre';
        });
        this.markDirty();
    }

    voteCharacter(characterId) {
        const character = this.getById(characterId);
        if (!character) {
            throw new Error('Personaje no encontrado');
        }

        character.votes = (character.votes || 0) + 1;
        this.markDirty();
        return character;
    }

    getTopByVotes(limit = 10) {
        return [...this.characters]
            .filter(c => c.votes > 0)
            .sort((a, b) => b.votes - a.votes)
            .slice(0, limit);
    }

    searchByName(name) {
        const searchTerm = name.toLowerCase();
        return this.characters.filter(c => 
            c.name.toLowerCase().includes(searchTerm)
        );
    }

    getByGender(gender) {
        return this.indexByGender.get(gender) || [];
    }

    getBySource(source) {
        return this.indexBySource.get(source) || [];
    }

    getCharacterStats(characterId) {
        const character = this.getById(characterId);
        if (!character) {
            return null;
        }

        return {
            id: character.id,
            name: character.name,
            gender: character.gender || 'Desconocido',
            value: character.value || 0,
            source: character.source || 'Desconocido',
            owner: character.user ? character.user.split('@')[0] : 'Nadie',
            status: character.status || 'Libre',
            votes: character.votes || 0,
            images: character.img ? character.img.length : 0,
            videos: character.vid ? character.vid.length : 0
        };
    }
}