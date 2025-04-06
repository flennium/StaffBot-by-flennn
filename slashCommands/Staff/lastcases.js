const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
 const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json")

module.exports = {
  name: 'lastcases',
  description: 'Retrieve the last cases for a user in a specific platform.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'user',
      description: 'The user for whom you want to retrieve the last cases.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'platform',
      description: 'The platform for which you want to retrieve the last cases.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'MINECRAFT', value: 'MINECRAFT' },
        { name: 'DISCORD', value: 'DISCORD' },
       { name: 'COMPENSATION', value: 'COMPENSATION' },
      ],
    },
  ],
  run: async (client, interaction) => {
    const user = interaction.options.getUser('user');
    const platform = interaction.options.getString('platform').toUpperCase();
	const staffRoles = [staffrole];
	const hasStaffRole = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId));

if (!hasStaffRole) {
  return interaction.reply({ content: '❌ You need to be a staff to use this command.', ephemeral: true });
} 
    try {
      const userCases = await CaseModel.find({
        'Staff.UserID': user.id,
        'Staff.cases.platform': platform,
      }).sort({ 'Staff.cases.Timestamp': -1 }).limit(25);

      if (userCases.length > 0) {
        const casesInfo = userCases.map((caseData) => {
          const platformCases = caseData.Staff.cases.filter((c) => c.platform === platform);
          const lastCases = platformCases.slice(0, 10);
          
          return lastCases.map((lastCase) => ({
            IGN: lastCase.IGN,
            Reason: lastCase.Reason,
            PunishmentType: lastCase.PunishmentType,
            Duration: lastCase.duration,
            Evidence: lastCase.Evidence,
            CaseID: lastCase.CaseID,
            time: lastCase.Timestamp,
          }));
        }).flat();

          let desc;
if (platform === 'DISCORD' || platform === 'MINECRAFT' ) {
   desc = casesInfo.map((caseInfo) => `
#${caseInfo.CaseID} | **${caseInfo.PunishmentType}** | **${caseInfo.Duration}** | **${caseInfo.IGN}** | <t:${Math.floor(caseInfo.time / 1000)}:R>`
            ).join('') + "\n\n <:staffinfo:1165731241673371708> \`#CASEID\` | \`PUNISHMENT - DURATION\` | \`PLAYER\` | \`LOGGED\`"
} else {
       desc = casesInfo.map((caseInfo) => `
#${caseInfo.CaseID} | **${caseInfo.IGN}** | <t:${Math.floor(caseInfo.time / 1000)}:R>`
            ).join('') + "\n\n <:staffinfo:1165731241673371708> \`#CASEID\` | \`PLAYER\` | \`LOGGED\`"
}
        const casesEmbed = new EmbedBuilder()
          .setTitle(`Last Cases - ${platform}`)
          .setColor('#FF8C00')
          .setDescription(desc)
       .setTimestamp()
        .setFooter({ text: servername, iconURL: client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [casesEmbed] });
      }

      return interaction.reply({ content: 'No cases found for the specified user and platform.', ephemeral: true });
    } catch (e) {
      console.error(e);
      return interaction.reply({ content: 'An error occurred while retrieving case information.', ephemeral: true });
    }
  },
};
