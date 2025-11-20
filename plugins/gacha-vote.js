export default {
    commands: ['vote', 'votar'],
    
    async execute(sock, m, { chatId, sender, args }) {
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Debes especificar el nombre del personaje.\nUso: #vote <personaje>'
            });
        }

        const charName = args.join(' ').toLowerCase();
        const userData = global.db.users[sender];

        if (!userData.gacha.votes) {
            userData.gacha.votes = {};
        }

        const lastVote = userData.gacha.votes[charName] || 0;
        const COOLDOWN = 24 * 60 * 60 * 1000;

        if (Date.now() - lastVote < COOLDOWN) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Ya votaste por este personaje hoy. Vuelve mañana.'
            });
        }

        userData.gacha.votes[charName] = Date.now();

        if (!global.db.waifus[charName]) {
            global.db.waifus[charName] = { votes: 0 };
        }

        global.db.waifus[charName].votes = (global.db.waifus[charName].votes || 0) + 1;

        await sock.sendMessage(chatId, {
            text: `ꕥ Has votado por ${args.join(' ')}\n` +
                `Votos totales: ${global.db.waifus[charName].votes}`
        });
    }
};
