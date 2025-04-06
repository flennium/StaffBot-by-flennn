const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
 const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json")

module.exports = {
  name: 'caselist',
  description: 'Show all cases for a player in any platform.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'playername',
      description: 'The player username for which you want to retrieve all cases.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'platform',
      description: 'The platform for which you want to retrieve the cases.',
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
    const username = interaction.options.getString('playername');
    const platform = interaction.options.getString('platform').toUpperCase();
	const staffRoles = [staffrole];
	const hasStaffRole = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId));

if (!hasStaffRole) {
  return interaction.reply({ content: '❌ You need to be a staff to use this command.', ephemeral: true });
} 
      let emoji;
   if (platform === 'MINECRAFT') {
      emoji = '<:staffminecraft:1165652133635432489> ';
    } else if (platform === 'DISCORD') {
      emoji = '<:staffdiscord:1165652417954713671> ';
    } else if (platform === 'COMPENSATION') {
      emoji = '✉';
    }
    try {
      const cases = await CaseModel.find({
        'Staff.cases.platform': platform,
        'Staff.cases.IGN': username,
      });

      if (cases.length > 0) {
        const casesInfo = cases.map((caseData) => ({
          CaseID: caseData.Staff.cases[0].CaseID,
          IGN: caseData.Staff.cases[0].IGN,
          Reason: caseData.Staff.cases[0].Reason,
          PunishmentType: caseData.Staff.cases[0].PunishmentType,
          Duration: caseData.Staff.cases[0].duration,
          Evidence: caseData.Staff.cases[0].Evidence,
          time: caseData.Staff.cases[0].Timestamp,
        }));
          let desc;
if (platform === 'DISCORD' || platform === 'MINECRAFT' ) {
   desc = casesInfo.map((caseInfo) => `
#${caseInfo.CaseID} | **${caseInfo.PunishmentType}** | **${caseInfo.Duration}** | ${caseInfo.IGN} | <t:${Math.floor(caseInfo.time / 1000)}:R>`
            ).join('') + "\n\n <:staffinfo:1165731241673371708> \`#CASEID\` | \`PUNISHMENT - DURATION\` | \`PLAYERNAME\` | \`LOGGED\`\nCheck cases using /caseinfo [caseid]"
} else {
       desc = casesInfo.map((caseInfo) => `
#${caseInfo.CaseID} | ${caseInfo.IGN} | <t:${Math.floor(caseInfo.time / 1000)}:R>`
            ).join('') + "\n\n <:staffinfo:1165731241673371708> \`#CASEID\` | \`PLAYERNAME\` | \`LOGGED\`\nCheck cases using /caseinfo [caseid]"
}
        const casesEmbed = new EmbedBuilder()
          .setTitle(`${emoji} Punishments of ${username} - ${platform}`)
          .setColor('#FF8C00')
          .setDescription(desc)
       .setTimestamp()
        .setFooter({ text: servername, iconURL: client.user.displayAvatarURL()});

        return interaction.reply({ embeds: [casesEmbed] });
      }

      return interaction.reply({ content: `No cases found for the specified ${platform} IGN.`, ephemeral: true });
    } catch (e) {
      console.error(e);
      return interaction.reply({ content: 'An error occurred while retrieving case information.', ephemeral: true });
    }
  },
};
