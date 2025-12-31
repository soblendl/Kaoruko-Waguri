export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
};

export const formatNumberLarge = (num) => {
    const suffixes = [
        { val: 1e33, suffix: 'Dc' },
        { val: 1e30, suffix: 'No' },
        { val: 1e27, suffix: 'Oc' },
        { val: 1e24, suffix: 'Sp' },
        { val: 1e21, suffix: 'Sx' },
        { val: 1e18, suffix: 'Qi' },
        { val: 1e15, suffix: 'Qa' },
        { val: 1e12, suffix: 'T' },
        { val: 1e9, suffix: 'B' },
        { val: 1e6, suffix: 'M' },
        { val: 1e3, suffix: 'K' }
    ];

    for (const { val, suffix } of suffixes) {
        if (num >= val) {
            const formatted = (num / val).toFixed(1);
            // Remove .0 if present
            return (formatted.endsWith('.0') ? Math.floor(num / val) : formatted) + suffix;
        }
    }

    return num.toString();
};

export const getMentions = (text) => {
    const matches = text.match(/@(\d+)/g);
    if (!matches) return [];
    return matches.map(m => m.slice(1) + '@s.whatsapp.net');
};

import { groupMetadataCache } from './GroupMetadataCache.js';

export const isAdmin = async (bot, chatId, userId) => {
    try {
        const sock = bot.ws || bot.sock || bot;

        // Obtener metadata del grupo
        let groupMetadata;
        try {
            groupMetadata = await groupMetadataCache.get(sock, chatId);
        } catch (cacheError) {
            groupMetadata = await sock.groupMetadata(chatId);
        }

        if (!groupMetadata || !groupMetadata.participants) {
            return false;
        }

        // Extraer número base del userId
        const userNumber = userId.split('@')[0].split(':')[0];

        // Buscar al participante
        const participant = groupMetadata.participants.find(p => {
            const participantNumber = p.id.split('@')[0].split(':')[0];
            return participantNumber === userNumber;
        });

        if (!participant) return false;

        return participant.admin === 'admin' || participant.admin === 'superadmin';
    } catch (error) {
        console.error(`[isAdmin] Error:`, error.message);
        return false;
    }
};

export const isBotAdmin = async (bot, chatId) => {
    try {
        const sock = bot.ws || bot.sock || bot;

        // Obtener metadata del grupo
        let groupMetadata;
        try {
            groupMetadata = await groupMetadataCache.get(sock, chatId);
        } catch (cacheError) {
            groupMetadata = await sock.groupMetadata(chatId);
        }

        if (!groupMetadata || !groupMetadata.participants) return false;

        // IDs del bot
        const user = sock.user;
        const botLid = user?.lid?.split(':')[0]?.split('@')[0];
        const botId = user?.id?.split(':')[0]?.split('@')[0];

        // Buscar el bot en los participantes (por LID o por ID normal)
        // La versión original buscaba uno por uno, pero esta es la lógica segura estándar
        const participant = groupMetadata.participants.find(p => {
            const pId = p.id.split(':')[0].split('@')[0];
            return (botLid && pId === botLid) || (botId && pId === botId);
        });

        if (!participant) return false;

        return participant.admin === 'admin' || participant.admin === 'superadmin';
    } catch (error) {
        console.error(`[isBotAdmin] Error:`, error.message);
        return false;
    }
};


export const getBuffer = async (url) => {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
};

export const getRandom = (list) => {
    return list[Math.floor(Math.random() * list.length)];
};

export const getGroupAdmins = (participants) => {
    return participants.filter(p => p.admin).map(p => p.id);
};

export const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

export const getCooldown = (lastTime, cooldownMs) => {
    const now = Date.now();
    const timeLeft = lastTime + cooldownMs - now;
    return timeLeft > 0 ? timeLeft : 0;
};

export const extractMentions = (ctx) => {
    const mentioned = ctx.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return mentioned;

    const matches = (ctx.body || ctx.text || '').match(/@(\d+)/g);
    if (!matches) return [];
    return matches.map(m => m.slice(1) + '@s.whatsapp.net');
};

const owners = [
    '573115434166@s.whatsapp.net',
    '526631079388@s.whatsapp.net',
    '573114910796@s.whatsapp.net'
];

export const isOwner = (userId, specificOwner) => {
    if (specificOwner) return userId === specificOwner;
    return owners.includes(userId);
};

export const formatCoins = (amount) => {
    return amount.toLocaleString('es-ES');
};

export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getName = async (bot, chatId, userId) => {
    try {
        const sock = bot.sock || bot;
        if (chatId.endsWith('@g.us')) {
            const groupMetadata = await groupMetadataCache.get(sock, chatId);
            const participant = groupMetadata.participants.find(p => p.id === userId);
        }
        return userId.split('@')[0];
    } catch (e) {
        return userId.split('@')[0];
    }
};

export const styleText = (text) => {
    return text
        .replace(/a/g, 'ᥲ')
        .replace(/e/g, 'ꫀ')
        .replace(/t/g, 't')
        .replace(/u/g, 'ᥙ')
        .replace(/x/g, 'ꪎ')
        .replace(/y/g, 'ᥡ');
};

export const styleMessage = (senderName, messageText) => {
    const header = `┌──「 *${senderName}* 」`;
    const body = `│  ${messageText}`;
    const footer = `└─`;
    return `${header}\n${body}\n${footer}`;
};
