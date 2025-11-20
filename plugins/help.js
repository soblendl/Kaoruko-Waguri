export default {
    commands: ['help', 'menu'],
    
    async execute(ctx) {
        const senderNumber = ctx.sender.split('@')[0];
        const username = ctx.from?.name || senderNumber;
        
        const helpText = `Hola ${username}, soy *Kaoruko Waguri*, esta es la lista de comandos:

╭━━━ Powered By DeltaByte ━━━╮
│
│ 𖣂 Powered by: DeltaByte
│ 𖣂 Version: v1.0
│ 𖣂 Canal oficial: https://whatsapp.com/channel/0029VbB9SA10rGiQvM2DMi2p
│
╰━━━━━━━━━━━━━━━━━━━━━━╯

 ୨୧ — Economía
╰↷ Gana monedas, apuesta y juégatela, el que no arriesga no gana ₍｡≧ ⁠ᵕ ≦｡₎♡

✿ *#economy* + [ on/off ]
> ➥ Desactiva o activa el sistema de economia.
✿ *#balance* » *#bal*
> ➥ ver tus coins
✿ *#coinflip* » *#cf* + [ cantidad ] + [ cara/cruz ]
> ➥ apuesta cara o cruz
✿ *#crime* 
> ➥ haz un robo y gana dinero
✿ *#daily* 
> ➥ Reclama tu recompensa diaria
✿ *#deposit* » *#d* + [ cantidad ]
> ➥ Guarda tus coins
✿ *#economyboard* » *#baltop*
> ➥ Mira el top de usuarios con mas monedas.
✿ *#givecoins* » *#pay* + [ @user ]
> ➥ Regala coins a un usuario.
✿ *#roulette* » *#rt* + [ red/black ] + [ cantidad ]
> ➥ Gira la ruleta y gana coins 
✿ *#slut* 
> ➥ ponte en la esquina y preparate para ganar coins a traves de un trabajo dudoso.
✿ *#steal* + [ @user ]
> ➥ Roba coins a un usuario.
✿ *#withdraw* » #wd + [ cantidad ] (all)
> ➥ Retira una cierta cantidad de coins, o todo.
✿ *#work* » *#w*
> ➥ Trabaja y gana coins.
✿ *#einfo* + [ @user ]
> ➥ Mira la estadisticas de economia de alguien.

 ୨୧ — Gacha
╰↷ Colecciona waifus y intercambialos.

✿ *#claim* » *#c* 
> ➥ Reclama una waifu aleatoria.
✿ *#harem* » *#miswaifu*
> ➥ Mira las waifus que tienes.
✿ *#rollwaifu* » *#rw*
> ➥ Mira una waifu aleatoria
✿ *#give* » *#regalar* + [ id ] + [ @user ]
> ➥ Regala una waifu a alguien.
✿ *#sell* » *#vender* + [ id ]
> ➥ Vende un personaje.
✿ *#antirobo* » *#proteger* + [ hora/dia/semana/mes ]
> ➥ Protege tus waifus de robos.
✿ *#dar* + [ @user ] + [ id ]
> ➥ Da un personaje a otro usuario.
✿ *#desbloquear* » *#unlock* + [ @user ]
> ➥ Desbloquea la base de un usuario.
✿ *#listawaifus* » *#listwaifus* + [ página ]
> ➥ Muestra la lista completa de personajes.
✿ *#robarwaifu* » *#robar* + [ id ]
> ➥ Roba un personaje de otro usuario.
✿ *#resetwaifus*
> ➥ Reinicia todas las waifus (solo owner).

 ୨୧ — Descargas
╰↷ Comandos para descargar algun contenido de una plataforma.

✿ *#ig* + [ link ]
> ➥ Descarga un video de un video de instagram.
✿ *#tiktok* + [ link ]
> ➥ Descarga un video de tiktok.
✿ *#mediafire* » *#mf* + [ link ]
> ➥ Descarga un archivo de Mediafire.
✿ *#youtube* + [ link ]
> ➥ Descarga un mp3 o un mp4 de youtube.
✿ *#fb* + [ link ]
> ➥ Descarga un video de Facebook.

 ୨୧ — Utilidades
╰↷ Comandos utiles 

✿ *#ping* » *#p*
> ➥ Calcula la velocidad del bot.
✿ *#ai* » *ia* + [ texto ]
> ➥ Consulta con Gemini.

 ୨୧ — Administración
╰↷ Administra tu grupo y/o comunidad de manera mas sencilla

✿ *#kick* + [ @user ]
> ➥ Expulsa a alguien del grupo.
✿ *#ban* + [ @user ]
> ➥ Banea a alguien del grupo.
✿ *#antilink* + [ on/off ]
> ➥ Desactiva o activa el antilink.
✿ *#tag* + [ text ]
> ➥ Anuncia un mensaje a todo el grupo.
✿ *#promote* + [ @user ]
> ➥ promueve a alguien a administrador.
✿ *#demote* + [ @user ]
> ➥ Remueve el administrador a alguien.
✿ *#welcome* + [ on/off ]
> ➥ Activa o desactiva la funcion de bienvenida.
✿ *#alertas* + [ on/off ]
> ➥ Activa o desactiva el sistema de alertas.

────୨ৎ────`;

        try {
            await ctx.bot.sock.sendMessage(ctx.chatId, {
                text: helpText,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363421377964290@newsletter",
                        newsletterName: "𝕻𝖔𝖜𝖊𝖗𝖊𝖉 𝕭𝐲 𝕯𝖊𝖑𝖙𝖆𝕭𝐲𝖙𝖊",
                        serverMessageId: 1,
                    },
                    externalAdReply: {
                        title: "Kaoruko Waguri",
                        body: "𝕻𝖔𝖜𝖊𝖗𝖊𝖉 𝕭𝐲 𝕯𝖊𝖑𝖙𝖆𝕭𝐲𝖙𝖊",
                        thumbnailUrl: "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/647jkw8t5rv.jpg",
                        mediaType: 1,
                        sourceUrl: "https://whatsapp.com/channel/0029VbB9SA10rGiQvM2DMi2p",
                        renderLargerThumbnail: true,
                    },
                },
            });
        } catch (error) {
            await ctx.reply(helpText);
        }
    }
};
