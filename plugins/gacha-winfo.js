const WAIFUS_INFO = {
    'asuna': { name: 'Asuna', series: 'Sword Art Online', rarity: 5, description: 'La heroína principal de SAO' },
    'rem': { name: 'Rem', series: 'Re:Zero', rarity: 5, description: 'Una de las sirvientas gemelas' },
    'zero two': { name: 'Zero Two', series: 'Darling in the FranXX', rarity: 5, description: 'La piloto híbrida' },
    'mikasa': { name: 'Mikasa', series: 'Attack on Titan', rarity: 4, description: 'Soldado de élite' },
    'hinata': { name: 'Hinata', series: 'Naruto', rarity: 4, description: 'Heredera del clan Hyuga' },
    'nezuko': { name: 'Nezuko', series: 'Demon Slayer', rarity: 5, description: 'La hermana demonio de Tanjiro' }
};

export default {
    commands: ['winfo'],
    
    async execute(sock, m, { chatId, args }) {
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Debes especificar el nombre del personaje.\nUso: #winfo <personaje>'
            });
        }

        const charName = args.join(' ').toLowerCase();
        const info = WAIFUS_INFO[charName];

        if (!info) {
            return await sock.sendMessage(chatId, {
                text: 'ꕤ Personaje no encontrado en la base de datos.'
            });
        }

        const stars = 'ꕤ'.repeat(info.rarity);
        const votes = global.db.waifus?.[charName]?.votes || 0;

        await sock.sendMessage(chatId, {
            text: `ꕥ *Información del Personaje*\n\n` +
                `ꕤ Nombre: ${info.name}\n` +
                `ꕤ Serie: ${info.series}\n` +
                `${stars} Rareza: ${info.rarity}/5\n` +
                `📖 ${info.description}\n` +
                `❤️ Votos: ${votes}`
        });
    }
};
