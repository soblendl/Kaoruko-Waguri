
export class GroupMetadataCache {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000;
    }

    async get(bot, groupId) {
        const cached = this.cache.get(groupId);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.ttl) {
            return cached.data;
        }

        const sock = bot.sock || bot;
        const metadata = await sock.groupMetadata(groupId);
        
        this.cache.set(groupId, {
            data: metadata,
            timestamp: now
        });

        return metadata;
    }

    invalidate(groupId) {
        this.cache.delete(groupId);
    }

    clear() {
        this.cache.clear();
    }
}

export const groupMetadataCache = new GroupMetadataCache();
