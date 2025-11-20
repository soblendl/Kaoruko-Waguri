export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
};

export const getMentions = (text) => {
    const matches = text.match(/@(\d+)/g);
    if (!matches) return [];
    return matches.map(m => m.slice(1) + '@s.whatsapp.net');
};

import { groupMetadataCache } from './GroupMetadataCache.js';

export const isAdmin = async (bot, chatId, userId) => {
    try {
        const groupMetadata = await groupMetadataCache.get(bot, chatId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
};

export const isBotAdmin = async (bot, chatId) => {
    try {
        const sock = bot.sock || bot;
        const groupMetadata = await groupMetadataCache.get(bot, chatId);
        const botId = sock.user.id;
        const participant = groupMetadata.participants.find(p => p.id === botId);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
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

export const isOwner = (userId, ownerNumber = '5217971282613@s.whatsapp.net') => {
    return userId === ownerNumber;
};

export const formatCoins = (amount) => {
    return amount.toLocaleString('es-ES');
};

export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
