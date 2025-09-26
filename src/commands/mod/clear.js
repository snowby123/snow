// src/commands/mod/clear.js
const { PermissionsBitField } = require("discord.js");
const allowedRoles = [
  "1407700848829796372",
];

module.exports = {
  name: "clear",
  description: "Limpa uma quantidade de mensagens no canal. Ex: !clear 10",
  async execute(message, args) {
    // Permissão do executor
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Você não tem permissão para gerenciar mensagens.");
    }

    // Permissão do bot
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Eu não tenho permissão para gerenciar mensagens neste canal.");
    }

    // Checa se a quantidade foi passada
    const amount = parseInt(args[0], 10);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply("❌ Informe um número entre 1 e 100 para apagar mensagens.");
    }

    try {
      // Apaga mensagens. +1 inclui a mensagem do comando
      await message.channel.bulkDelete(amount + 1, true);

      const replyMsg = await message.channel.send(`✅ ${amount} mensagens apagadas com sucesso.`);
      // Remove a confirmação depois de 5 segundos
      setTimeout(() => replyMsg.delete().catch(() => {}), 5000);
    } catch (err) {
      console.error("Erro ao apagar mensagens:", err);
      return message.reply("❌ Ocorreu um erro ao tentar apagar mensagens.");
    }
  },
};
