const { EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { highstaffrole, prefix, servername } = require('../../configs/serverinfo.json');

module.exports = {
  name: 'staffclear',
  description: 'Clear points or cases for a staff member or for all staff members.',
  aliases: ['clearcases', 'clearpoints'],
  cooldown: 3000,
  async execute(message, args) {
    if (message.author.bot) return;
      
      if (!message.member.roles.cache.has(highstaffrole)) {
          return message.reply({ content: `❌ You need to be a Staff Manager.`, ephemeral: true });
      }

    if (args.length < 2) {
      return message.reply({ content: `Usage: \`${prefix}staffclear @user <points/cases>\` or \`${prefix}staffclear all <points/cases>\` `, ephemeral: true });
    }

    const staffUser = message.mentions.users.first();
    const target = args[1].toLowerCase();

    if (!['points', 'cases'].includes(target) && target !== 'all') {
      return message.reply({ content: '❌ Please specify whether to clear `points`, `cases`, or `all`.', ephemeral: true });
    }

    try {
      if (target === 'all') {
        if (args[2].toLowerCase() === 'points') {
          const allStaffCases = await CaseModel.find();
          for (const staffCases of allStaffCases) {
            staffCases.Staff.Points[0].discord = 0;
            staffCases.Staff.Points[0].minecraft = 0;
            staffCases.Staff.Points[0].compensation = 0;
            await staffCases.save();
          }

          const clearPointsEmbed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('All Points Cleared')
            .setDescription('All points for Discord, Minecraft, and Compensation have been reset to `0` for all staff members.')
            .setTimestamp()
            .setFooter({ text: servername, iconURL: message.client.user.displayAvatarURL() });

          return message.reply({ embeds: [clearPointsEmbed] });

        } else if (args[2].toLowerCase() === 'cases') {
          const allStaffCases = await CaseModel.find();
          for (const staffCases of allStaffCases) {
            staffCases.Staff.cases = [];
            await staffCases.save();
          }

          const clearCasesEmbed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('All Cases Cleared')
            .setDescription('All logged cases have been cleared for all staff members.')
            .setTimestamp()
            .setFooter({ text: servername, iconURL: message.client.user.displayAvatarURL() });

          return message.reply({ embeds: [clearCasesEmbed] });

        } else {
          return message.reply({ content: '❌ Please specify whether to clear `points` or `cases` for all staff members.', ephemeral: true });
        }

      } else if (staffUser) {
        const staffCases = await CaseModel.findOne({ 'Staff.UserID': staffUser.id });

        if (!staffCases) {
          return message.reply({ content: 'No cases found for the specified staff user.', ephemeral: true });
        }

        if (target === 'points') {
          staffCases.Staff.Points[0].discord = 0;
          staffCases.Staff.Points[0].minecraft = 0;
          staffCases.Staff.Points[0].compensation = 0;
          await staffCases.save();

          const clearPointsEmbed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('Points Cleared')
            .setDescription(`
<:staffstar:1165300131982233640> **Staff**
> ${staffUser.username} ( <@${staffUser.id}> )

All points for Discord, Minecraft, and Compensation have been reset to \`0\`.
            `)
            .setTimestamp()
            .setFooter({ text: servername, iconURL: message.client.user.displayAvatarURL() });

          return message.reply({ embeds: [clearPointsEmbed] });

        } else if (target === 'cases') {
          staffCases.Staff.cases = [];
          await staffCases.save();

          const clearCasesEmbed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('Cases Cleared')
            .setDescription(`
<:staffstar:1165300131982233640> **Staff**
> ${staffUser.username} ( <@${staffUser.id}> )

All logged cases have been cleared.
            `)
            .setTimestamp()
            .setFooter({ text: servername, iconURL: message.client.user.displayAvatarURL() });

          return message.reply({ embeds: [clearCasesEmbed] });

        } else {
          return message.reply({ content: '❌ Invalid target specified.', ephemeral: true });
        }

      } else {
        return message.reply({ content: '❌ Please mention a valid user.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      return message.reply({ content: 'An error occurred while clearing points or cases.', ephemeral: true });
    }
  },
};
