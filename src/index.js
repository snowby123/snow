require('dotenv').config(); // Carrega o .env **uma vez** no topo
const allowedRoles = [
  "1407700848829796372", // IDs de cargos permitidos
];

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const prefix = "!"; // define o prefixo para comandos

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,      // necessário para prefix commands
    GatewayIntentBits.GuildVoiceStates     // necessário para operações em voz / setMute
  ],
});

// Coleções para comandos
client.commands = new Collection();

// Handlers
require("./handlers/commandHandler")(client);
require("./handlers/eventHandler")(client);

// Login
client.login(process.env.DISCORD_TOKEN);

// --------------------
// Evento para lidar com mensagens de prefixo
client.on("messageCreate", async (message) => {
    // Ignora mensagens de bots
    if (message.author.bot) return;

    // Ignora mensagens que não começam com o prefixo
    if (!message.content.startsWith(prefix)) return;

    // Divide a mensagem em comando + args
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Procura comando na coleção
    const command = client.commands.get(commandName);
    if (!command) return;

    // ✅ Verifica se o usuário possui algum cargo permitido
    const memberRoles = message.member.roles.cache.map(r => r.id);
    const hasAllowedRole = memberRoles.some(role => allowedRoles.includes(role));

    if (!hasAllowedRole) {
        return message.reply("❌ Você não tem permissão para executar este comando (cargo não permitido).");
    }

    // Executa comando
    try {
        await command.execute(message, args);
    } catch (err) {
        console.error(err);
        message.reply("❌ Ocorreu um erro ao executar este comando.");
    }
});
