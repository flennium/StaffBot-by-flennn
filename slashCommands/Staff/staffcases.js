const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json");

module.exports = {
  name: 'staffcases',
  description: 'Show the case counts for a staff user.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'user',
      description: 'The staff user for whom you want to retrieve the case counts.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const staffUser = interaction.options.getUser('user');
    const hasStaffRole = interaction.member.roles.cache.has(staffrole);

    if (!hasStaffRole) {
      return interaction.reply({ content: '❌ You need to be a staff to use this command.', ephemeral: true });
    }

    try {
      const staffCases = await CaseModel.findOne({ 'Staff.UserID': staffUser.id });

      let minecraftCasesCount = 0;
      let discordCasesCount = 0;
      let compensationCasesCount = 0;

      if (staffCases) {
        minecraftCasesCount = staffCases.Staff.cases.filter(c => c.platform === 'MINECRAFT').length;
        discordCasesCount = staffCases.Staff.cases.filter(c => c.platform === 'DISCORD').length;
        compensationCasesCount = staffCases.Staff.cases.filter(c => c.platform === 'COMPENSATION').length;
      }

      const totalCasesCount = minecraftCasesCount + discordCasesCount + compensationCasesCount;

      const staffCasesEmbed = new EmbedBuilder()
        .setColor('#FF8C00')
        .setDescription(`
<:staffstar:1165300131982233640> **Staff**
> ${staffUser.globalName} ( <@${staffUser.id}> )

<:staffminecraft:1165652133635432489> **Minecraft Cases**
> \`${minecraftCasesCount}\` total Minecraft cases logged.

<:staffdiscord:1165652417954713671> **Discord Cases**
> \`${discordCasesCount}\` total Discord cases logged.

✉ **Compensation Cases**
> \`${compensationCasesCount}\` total compensation cases logged.

:diamond_shape_with_a_dot_inside: **Total Cases**
> \`${totalCasesCount}\` total cases logged.
        `)
        .setTimestamp()
        .setFooter({ text: servername, iconURL: client.user.displayAvatarURL() });

      return interaction.reply({ embeds: [staffCasesEmbed] });

    } catch (e) {
      console.error(e);
      return interaction.reply({ content: 'An error occurred while retrieving case information.', ephemeral: true });
    }
  },
};