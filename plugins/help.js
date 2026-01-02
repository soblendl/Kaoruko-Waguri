import fs from 'fs';

export default {
    commands: ['help', 'menu'],

    async execute(ctx) {
        const senderNumber = ctx.sender.split('@')[0];
        const username = ctx.from?.name || senderNumber;
        const tokenService = ctx.tokenService;
        const userId = ctx.senderPhone ? `${ctx.senderPhone}@s.whatsapp.net` : ctx.sender;
        const prembotConfig = tokenService?.getPrembotConfig?.(userId);
        const botName = prembotConfig?.customName || 'Hatsune Miku';
        let menuImage = './images/menu.jpg';
        if (prembotConfig?.customImage && fs.existsSync(prembotConfig.customImage)) {
            menuImage = prembotConfig.customImage;
        }
        const userCount = ctx.dbService?.getUserCount?.() || 0;

        const helpText = `╭─────── ୨୧ ───────╮
│  Bot Name › *${botName}*
│  Hola, *${username}*
│  ¿Listo para empezar?
╰─── ⚐ DeltaByte ─────╯
│ ✦ Canal    › whatsapp.com/channel/0029VbB9SA10rGiQvM2DMi2p
│ ✦ Usuarios › *${userCount}*
│ ✦ v2.9     › Usuario: ${username}
╰────────────────╯

 ⊹ *Economía⊹ ࣪ ˖*
✎ \`G𝖺𝗇𝖺 𝗆𝗈𝗇𝖾𝖽𝖺𝗌, 𝖺𝗉𝗎𝖾𝗌𝗍𝖺 𝗒 𝗃𝗎é𝗀𝖺𝗍𝖾𝗅𝖺\`
✿ *::* *#economy* \`<on/off>\`
> » Desactiva o activa el sistema de economía.
✿ *::* *#balance* • *#bal*
> » Ver tus coins.
✿ *::* *#coinflip* • *#cf* \`<cantidad>\` \`<cara/cruz>\`
> » Apuesta cara o cruz.
✿ *::* *#crime*
> » Haz un robo y gana dinero.
✿ *::* *#daily*
> » Reclama tu recompensa diaria.
✿ *::* *#deposit* • *#d* \`<cantidad>\`
> » Guarda tus coins.
✿ *::* *#economyboard* • *#baltop*
> » Mira el top de usuarios con más monedas.
✿ *::* *#givecoins* • *#pay* \`<@user>\`
> » Regala coins a un usuario.
✿ *::* *#roulette* • *#rt* \`<red/black>\` \`<cantidad>\`
> » Gira la ruleta y gana coins.
✿ *::* *#slut*
> » Trabaja dudosamente para ganar coins.
✿ *::* *#steal* \`<@user>\`
> » Roba coins a un usuario.
✿ *::* *#slot* \`<cantidad>\`
> » Apuesta en la tragaperras (x5 Jackpot).
✿ *::* *#withdraw* • *#wd* \`<cantidad|all>\`
> » Retira una cantidad de coins.
✿ *::* *#work* • *#w*
> » Trabaja y gana coins.
✿ *::* *#beg* • *#pedir*
> » Pide dinero en la calle.
✿ *::* *#fish* • *#pescar*
> » Pesca y gana coins (sistema de rarezas).
✿ *::* *#einfo* \`<@user>\`
> » Mira las estadísticas de economía de alguien.
✿ *::* *#season*
> » Mira la temporada actual del pase de batalla.
✿ *::* *#shop* • *#tienda* \`<pag>\`
> » Abre la tienda de Soblend.
✿ *::* *#buy* • *#comprar* \`<id> <ant>\`
> » Compra objetos de la tienda.
✿ *::* *#inventory* • *#inv*
> » Mira tus objetos comprados.
✿ *::* *#use* • *#usar* \`<id>\`
> » Usa un objeto de tu inventario.
✿ *::* *#level* • *#rank*
> » Mira tu nivel y XP actual.
✿ *::* *#blackjack* • *#bj* \`<apuesta>\`
> » Juega al 21 contra la casa.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Gacha⊹ ࣪ ˖*
✎ \`C𝗈𝗅𝖾𝖼𝖼𝗂𝗈𝗇𝖺 𝗐𝖺𝗂𝖿𝗎𝗌 𝖾 𝗂𝗇𝗍𝖾𝗋𝖼𝖺𝗆𝖻𝗂𝖺𝗅𝗈𝗌\`
✿ *::* *#claim* • *#c*
> » Reclama una waifu aleatoria.
✿ *::* *#harem* • *#miswaifu*
> » Mira las waifus que tienes.
✿ *::* *#rollwaifu* • *#rw*
> » Mira una waifu aleatoria.
✿ *::* *#give* • *#regalar* \`<id>\` \`<@user>\`
> » Regala una waifu a alguien.
✿ *::* *#sell* • *#vender* \`<id>\`
> » Vende un personaje.
✿ *::* *#antirobo* • *#proteger* \`<hora/dia/semana/mes>\`
> » Protege tus waifus de robos.
✿ *::* *#dar* \`<@user>\` \`<id>\`
> » Da un personaje a otro usuario.
✿ *::* *#desbloquear* • *#unlock* \`<@user>\`
> » Desbloquea la base de un usuario.
✿ *::* *#listawaifus* • *#listwaifus* \`<página>\`
> » Muestra la lista completa de personajes.
✿ *::* *#robarwaifu* • *#robar* \`<id>\`
> » Roba un personaje de otro usuario.
✿ *::* *#resetwaifus*
> » Reinicia todas las waifus (solo owner).
✿ *::* *#delwaifu* \`<id>\`
> » Elimina una waifu de tu colección.
✿ *::* *#vote*
> » Vota por tu waifu favorita.
✿ *::* *#wimage* \`<nombre>\`
> » Busca una imagen de un personaje.
✿ *::* *#winfo* \`<nombre>\`
> » Mira la información de un personaje.
✿ *::* *#wvideo* \`<nombre>\`
> » Mira un video de un personaje.
✿ *::* *#ainfo* \`<anime>\`
> » Ver todos los personajes de un anime específico.
✿ *::* *#wtop*
> » Mira el top de waifus más populares.
✿ *::* *#trade* • *#intercambio* \`<tu_personaje>\` \`<su_personaje>\` \`<@user>\`
> » Intercambia personajes con otro usuario.
✿ *::* *#wcow*
> » Mira la información de tus waifus.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Descargas⊹ ࣪ ˖*
✎ \`D𝖾𝗌𝖼𝖺𝗋𝗀𝖺 𝖼𝗈𝗇𝗍𝖾𝗇𝗂𝖽𝗈 𝖽𝖾 𝗉𝗅𝖺𝗍𝖺𝖿𝗈𝗋𝗆𝖺𝗌\`
✿ *::* *#ig* \`<link>\`
> » Descarga un video de Instagram.
✿ *::* *#tiktok* \`<link>\`
> » Descarga un video de TikTok.
✿ *::* *#mediafire* • *#mf* \`<link>\`
> » Descarga un archivo de Mediafire.
✿ *::* *#youtube* \`<link>\`
> » Descarga un mp3 o mp4 de YouTube.
✿ *::* *#play* \`<query/url>\`
> » Descarga música o video de YouTube.
✿ *::* *#ytmp3* \`<link>\`
> » Descarga audio de YouTube.
✿ *::* *#ytmp4* \`<link>\`
> » Descarga video de YouTube.
✿ *::* *#fb* \`<link>\`
> » Descarga un video de Facebook.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Buscadores⊹ ࣪ ˖*
✎ \`E𝗇𝖼𝗎𝖾𝗇𝗍𝗋𝖺 𝗅𝗈 𝗊𝗎𝖾 𝗇𝖾𝖼𝖾𝗌𝗂𝗍𝖺𝗌 𝖾𝗇 𝗅𝖺 𝗐𝖾𝖻\`
✿ *::* *#googleimages* • *#gimg* \`<texto>\`
> » Busca imágenes en Google.
✿ *::* *#pinterest* \`<texto>\`
> » Busca imágenes en Pinterest.
✿ *::* *#spotify* • *#song* \`<texto>\`
> » Busca y descarga música de Spotify.
✿ *::* *#soundcloud* \`<texto>\`
> » Busca y descarga música de SoundCloud.
✿ *::* *#tiktoksearch* • *#ttss* \`<texto>\`
> » Busca videos en TikTok (carousel).
✿ *::* *#ttuser* • *#tiktokuser* \`<usuario>\`
> » Obtiene info de un usuario de TikTok.
✿ *::* *#wikipedia* • *#wiki* \`<texto>\`
> » Busca información en Wikipedia.
✿ *::* *#lyrics* • *#letra* \`<texto>\`
> » Busca letras de canciones.
✿ *::* *#apk* • *#modapk* \`<texto>\`
> » Busca y descarga aplicaciones APK.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Utilidades⊹ ࣪ ˖*
✎ \`C𝗈𝗆𝖺𝗇𝖽𝗈𝗌 ú𝗍𝗂𝗅𝖾𝗌\`
✿ *::* *#ping* • *#p*
> » Calcula la velocidad del bot.
✿ *::* *#ai* • *#ia* \`<texto>\`
> » Consulta con Gemini.
✿ *::* *#gemini* \`<texto>\`
> » Consulta con Gemini AI.
✿ *::* *#copilot* \`<texto>\`
> » Habla con Microsoft Copilot AI.
✿ *::* *#claude* \`<texto>\`
> » Habla con Anthropic Claude AI.
✿ *::* *#chatgpt* • *#gpt* \`<texto>\`
> » Habla con ChatGPT AI.
✿ *::* *#sticker* • *#s*
> » Crea un sticker de una imagen o video.
✿ *::* *#toimg* • *#img*
> » Convierte un sticker en imagen.
✿ *::* *#suggest* \`<texto>\`
> » Envía una sugerencia al administrador.
✿ *::* *#hd*
> » Mejora la calidad de una imagen (responde a imagen).
✿ *::* *#obtenerinfo* \`<@user>\`
> » Obtiene información de JID de un usuario.
✿ *::* *#wanted* \`<@user>\`
> » Crea un poster de "Se Busca".
✿ *::* *#speak* \`<texto>\`
> » Convierte texto a voz (Adam).
✿ *::* *#pfp* • *#perfil* \`<@user>\`
> » Obtiene la foto de perfil de un usuario.
✿ *::* *#status* • *#estado*
> » Muestra el estado del bot (uptime, RAM, plataforma).
✿ *::* *#vision* \`<imagen>\`
> » Analiza imágenes con IA.
✿ *::* *#get* \`<url>\`
> » Realiza una petición HTTP GET.
✿ *::* *#ss* \`<url>\`
> » Toma una captura de pantalla de una web.
✿ *::* *#sora* \`<texto>\`
> » Genera un video con Sora AI.
✿ *::* *#profile*
> » Mira tu tarjeta de usuario y estadísticas.
✿ *::* *#setbirth* \`<DD/MM/YYYY>\`
> » Establece tu fecha de nacimiento.
✿ *::* *#setgen* \`<m/f>\`
> » Establece tu género.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Diversión⊹ ࣪ ˖*
✎ \`C𝗈𝗆𝖺𝗇𝖽𝗈𝗌 𝗉𝖺𝗋𝖺 𝗂𝗇𝗍𝖾𝗋𝖺𝖼𝗍𝗎𝖺𝗋\`
✿ *::* *#sleep* \`<@user>\`
> » Duerme o toma una siesta con alguien.
✿ *::* *#hug* \`<@user>\`
> » Abraza a alguien.
✿ *::* *#cry* \`<@user>\`
> » Llora por alguien o algo.
✿ *::* *#kiss* \`<@user>\`
> » Besa a alguien.
✿ *::* *#textpro* \`<efecto>\` \`<texto>\`
> » Crea imágenes con texto (neon, magma, etc).
✿ *::* *#dance* \`<@user>\`
> » Baila solo o con alguien.
✿ *::* *#kill* \`<@user>\`
> » Mata a alguien (o suicidate).
✿ *::* *#angry* \`<@user>\`
> » Muestra tu enojo.
✿ *::* *#bored* \`<@user>\`
> » Expresa tu aburrimiento.
✿ *::* *#coffee* \`<@user>\`
> » Toma café solo o acompañado.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Juegos⊹ ࣪ ˖*
✎ \`D𝗂𝗏𝗂é𝗋𝗍𝖾𝗍𝖾 𝖼𝗈𝗇 𝖾𝗌𝗍𝗈𝗌 𝗆𝗂𝗇𝗂𝗃𝗎𝖾𝗀𝗈𝗌\`
✿ *::* *#tictactoe* • *#ttt* \`<@user>\`
> » Juega al gato (tres en raya).
✿ *::* *#math*
> » Resuelve problemas matemáticos.
✿ *::* *#trivia* • *#quiz*
> » Responde preguntas y gana coins.
✿ *::* *#adivinanza* • *#adivina*
> » Resuelve adivinanzas y gana coins.
✿ *::* *#love* \`<@user>\`
> » Calculadora de amor.
✿ *::* *#gay* \`<@user>\`
> » Calculadora de porcentaje gay.
✿ *::* *#ppt* \`<piedra/papel/tijera>\`
> » Juega Piedra, Papel o Tijera.
✿ *::* *#ship* \`<@user1>\` \`<@user2>\`
> » Calcula la compatibilidad de amor entre dos personas.
✿ *::* *#fight* • *#pelea* \`<@user>\`
> » Pelea épica contra alguien (sistema de HP).
✿ *::* *#dare* • *#reto* \`<@user>\`
> » Dale un reto a alguien.
✿ *::* *#truth* • *#verdad* \`<@user>\`
> » Hazle una pregunta de verdad a alguien.
✿ *::* *#marry* • *#casar* \`<@user>\`
> » Matrimonio virtual con alguien.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Subbot⊹ ࣪ ˖*
✎ \`C𝗈𝗇𝗏𝗂𝖾𝗋𝗍𝖾 𝗍𝗎 𝗇ú𝗆𝖾𝗋𝗈 𝖾𝗇 𝗎𝗇 𝖻𝗈𝗍\`
✿ *::* *#code*
> » Obtén un código de 8 dígitos para vincular tu número.
✿ *::* *#qr* \`<código>\`
> » Obtén un código QR para vincularte.
✿ *::* *#jadibot*
> » Muestra las opciones para convertirte en subbot.
✿ *::* *#stopbot*
> » Detén tu subbot vinculado.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *NSFW⊹ ࣪ ˖*
✎ \`C𝗈𝗇𝗍𝖾𝗇𝗂𝖽𝗈 𝗉𝖺𝗋𝖺 𝖺𝖽𝗎𝗅𝗍𝗈𝗌\`
✿ *::* *#hbikini*
> » Imágenes de chicas en bikini.
✿ *::* *#himages*
> » Imágenes hentai aleatorias.
✿ *::* *#pornvideo*
> » Videos porno aleatorios.
*⊱⋅ ────── ⊹ ────── ⋅⊰*

 ⊹ *Administración⊹ ࣪ ˖*
✎ \`A𝖽𝗆𝗂𝗇𝗂𝗌𝗍𝗋𝖺 𝗍𝗎 𝗀𝗋𝗎𝗉𝗈 𝗒/𝗈 𝖼𝗈𝗆𝗎𝗇𝗂𝖽𝖺𝖽\`
⟡ *::* *#kick* \`<@user>\`
> » Expulsa a alguien del grupo.
✿ *::* *#ban* \`<@user>\`
> » Banea a alguien del grupo.
✿ *::* *#antilink* \`<on/off>\`
> » Activa el antilink (elimina enlaces de todos).
✿ *::* *#tag* \`<text>\`
> » Anuncia un mensaje a todo el grupo.
✿ *::* *#promote* \`<@user>\`
> » Promueve a alguien a administrador.
✿ *::* *#demote* \`<@user>\`
> » Remueve el administrador a alguien.
✿ *::* *#welcome* \`<on/off>\`
> » Activa/desactiva mensajes de bienvenida.
✿ *::* *#goodbye* \`<on/off>\`
> » Activa/desactiva mensajes de despedida.
✿ *::* *#alertas* \`<on/off>\`
> » Activa o desactiva el sistema de alertas.
✿ *::* *#kickall*
> » Elimina a todos los no-admins del grupo.
✿ *::* *#link* • *#enlace*
> » Obtiene el enlace de invitación del grupo.
✿ *::* *#gp* • *#gpinfo*
> » Información del grupo y estado de sistemas.
✿ *::* *#join* • *#invite* \`<link>\`
> » Une al bot a un grupo por link.
*⊱⋅ ────── ⊹ ────── ⋅⊰*`;

        try {
            try {
                await ctx.bot.sendMessage(ctx.chatId, {
                    text: helpText,
                    contextInfo: {
                        externalAdReply: {
                            title: "Hatsune Miku",
                            body: "Developed By Soblend Development Studio",
                            thumbnail: "https://files.catbox.moe/o6v8ne.jpg",
                            mediaType: 1,
                            sourceUrl: "https://bright-light.pages.dev",
                            renderLargerThumbnail: true
                        }
                    }
                });
            } catch (error) {
                console.error('[DEBUG] Error sending help with metadata:', error);
                ctx.reply(helpText);
            }
        } catch (error) {
            console.error('[DEBUG] Error sending help with metadata:', error);
            ctx.reply(helpText);
        }
    }
};
