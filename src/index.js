require('dotenv').config(); // Carrega o .env **uma vez** no topo
const allowedRoles = ["1407700848829796372"]; // IDs de cargos permitidos
const express = require('express');
const app = express();
const port = 3000;
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const prefix = "!"; // define o prefixo para comandos

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

// Coleções para comandos
client.commands = new Collection();

// Handlers
require("./handlers/commandHandler")(client);
require("./handlers/eventHandler")(client);

// --- Express sobe automaticamente ---
app.get("/", (req, res) => {
  res.send("Servidor Express rodando junto com o bot!");
});

app.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});

// --- Login do bot ---
client.login(process.env.DISCORD_TOKEN);

// --------------------
// Evento para lidar com mensagens de prefixo
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  // ✅ Verifica cargo
  const memberRoles = message.member.roles.cache.map(r => r.id);
  const hasAllowedRole = memberRoles.some(role => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return message.reply("❌ Você não tem permissão para executar este comando (cargo não permitido).");
  }

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ Ocorreu um erro ao executar este comando.");
  }
});
