const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ban",
  description: "Bane um membro do servidor",
  async execute(message, args) {
    // Verifica permissões
    if (!message.member.permissions.has("BAN_MEMBERS"))
      return message.reply("❌ Sem permissão para banir membros.");

    // Pega o usuário mencionado
    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mencione um usuário para banir.");

    // Define o motivo
    const motivo = args.slice(1).join(" ") || "Sem motivo";

    try {
      // Tenta banir o usuário
      await message.guild.members.ban(user.id, { reason: motivo });

      // Cria o embed para mostrar as informações do ban
      const banEmbed = new EmbedBuilder()
        .setTitle("🚫 Usuário banido")
        .setColor("Red")
        .addFields(
          { name: "Usuário", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Motivo", value: motivo, inline: true },
          { name: "Executado por", value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      // Envia o embed e marca a mensagem original
      await message.reply({ embeds: [banEmbed] });
    } catch (err) {
      console.error(err);
      message.reply("❌ Ocorreu um erro ao tentar banir este usuário.");
    }
  },
};
