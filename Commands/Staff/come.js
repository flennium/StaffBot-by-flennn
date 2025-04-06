const { EmbedBuilder } = require('discord.js');
const { guildID } = require('../../configs/serverinfo.json');

module.exports = {
  name: 'come',
  description: 'Invite a user to the channel',
  aliases: ['تعال'],
  async execute(message, args) {
    if (message.author.bot) return;
    if (message.guild.id !== guildID) return;

    if (!message.channel.name || !message.channel.name.startsWith("ticket-")) return;

    const targetUser = message.mentions.users.first() || message.client.users.cache.get(args[0]);

    if (!targetUser) {
      return message.reply('Please mention a user or provide a valid user ID.');
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('Invitation Sent!')
        .setDescription(`- **Hello ${targetUser}! You were invited to join the channel ${message.channel}.**\n\n**- مرحبًا ${targetUser}! تمت دعوتك للانضمام إلى القناة ${message.channel}.**`)
        .setColor('#FF8C00');

      await targetUser.send({ embeds: [embed] });

      message.reply(`- Sent a direct message to ${targetUser.tag}.`);
    } catch (error) {
      message.reply('Failed to send a direct message to the user.');
    }
  },
};
