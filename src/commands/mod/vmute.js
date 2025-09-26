// src/commands/mod/vmute.js
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "vmute",
  description: "Muta um membro nas voice calls por até 20 minutos. Ex: !vmute @user 10",
  async execute(message, args) {
    // Permissão do executor
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply("❌ Você não tem permissão para mutar membros.");
    }

    // Permissão do bot
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply("❌ Eu não tenho permissão para mutar membros. Peça para marcar a permissão `Mute Members` para o meu cargo.");
    }

    // Pegar alvo (menção ou ID)
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply("❌ Mencione ou passe o ID do usuário que deseja mutar.");

    // Verifica se o usuário está em uma voice channel
    if (!target.voice || !target.voice.channel) {
      return message.reply("❌ Esse usuário não está em um canal de voz agora.");
    }

    // Checagem de hierarquia
    const botHighest = message.guild.members.me.roles.highest.position;
    const targetHighest = target.roles.highest.position;
    if (targetHighest >= botHighest) {
      return message.reply("❌ Não posso mutar esse usuário (cargo igual ou superior ao meu).");
    }

    // Parse do tempo (em minutos). Limite de 1 a 20 minutos
    const minutes = Math.max(1, Math.min(20, parseInt(args[1], 10) || 5)); 
    const ms = minutes * 60 * 1000;

    // Motivo opcional
    const motivo = args.slice(2).join(" ") || "Sem motivo";

    try {
      // Aplica server mute
      await target.voice.setMute(true, `Mutado por ${message.author.tag} por ${minutes} minuto(s). Motivo: ${motivo}`);

      // Embed de confirmação (reply marca a mensagem)
      const embed = new EmbedBuilder()
        .setTitle("🔇 Usuário mutado (voz)")
        .setColor("DarkButNotBlack")
        .addFields(
          { name: "Usuário", value: `${target.user.tag} (${target.id})`, inline: true },
          { name: "Tempo", value: `${minutes} minuto(s)`, inline: true },
          { name: "Executado por", value: `${message.author.tag}`, inline: true },
          { name: "Motivo", value: motivo, inline: false }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      // Timer para desmutar automaticamente
      if (!message.client.voiceMuteTimers) message.client.voiceMuteTimers = new Map();
      if (message.client.voiceMuteTimers.has(target.id)) {
        clearTimeout(message.client.voiceMuteTimers.get(target.id));
      }

      const timeout = setTimeout(async () => {
        try {
          const refreshed = await message.guild.members.fetch(target.id).catch(() => null);
          if (refreshed && refreshed.voice && refreshed.voice.channel) {
            await refreshed.voice.setMute(false, `Auto-unmute após ${minutes} minuto(s)`);
            const unmuteEmbed = new EmbedBuilder()
              .setTitle("🔊 Usuário desmutado (voz)")
              .setColor("Green")
              .addFields(
                { name: "Usuário", value: `${refreshed.user.tag} (${refreshed.id})`, inline: true },
                { name: "Tempo total", value: `${minutes} minuto(s)`, inline: true },
                { name: "Motivo original", value: motivo, inline: false }
              )
              .setTimestamp();
            await message.channel.send({ embeds: [unmuteEmbed] }).catch(() => {});
          }
        } catch (err) {
          console.error("Erro ao desmutar automaticamente:", err);
        } finally {
          message.client.voiceMuteTimers.delete(target.id);
        }
      }, ms);

      message.client.voiceMuteTimers.set(target.id, timeout);
    } catch (err) {
      console.error("Erro ao mutar:", err);
      if (err?.code === 50013) {
        return message.reply("❌ Não tenho permissão para mutar esse usuário (verifique cargo e permissões).");
      }
      return message.reply("❌ Ocorreu um erro ao tentar mutar o usuário.");
    }
  },
};
