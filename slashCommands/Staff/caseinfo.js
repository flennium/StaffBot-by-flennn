const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json");

module.exports = {
  name: 'caseinfo',
  description: 'Retrieve information about a case.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'caseid',
      description: 'The ID of the case.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const caseID = interaction.options.getInteger('caseid');
    const staffRoles = [staffrole];
    const hasStaffRole = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasStaffRole) {
      return interaction.reply({ content: '❌ You need to be a staff to use this command.', ephemeral: true });
    }

    let desc;
    let emoji;
  
    try {
      const existingCase = await CaseModel.findOne({
        'Staff.cases.CaseID': caseID,
      });

      if (existingCase) {
        const caseData = existingCase.Staff.cases.find((c) => c.CaseID === caseID);

        if (caseData) {
          const staffuser = await client.users.fetch(existingCase.Staff.UserID);
          if (caseData.platform === 'DISCORD' || caseData.platform === 'MINECRAFT') {
            desc = `
<:staffstar:1165300131982233640> **Staff**
> ${staffuser.globalName} ( <@${existingCase.Staff.UserID}> )

<:staffplayer:1165300274399805461> **Player Name**
> ${caseData.IGN}

<:staffpaper:1165300346202095618> **Reason**
> ${caseData.Reason}

<:stafftime:1165300397049663559> **Punishment**
> ${caseData.PunishmentType} | ${caseData.duration}

<:staffurl:1165300470517092413> **Evidence**
> ${caseData.Evidence}

<:staffnumber:1165300421124956270> **Case**
> ${caseData.CaseID}
`;
          } else {
            desc = `
<:staffstar:1165300131982233640> **Staff**
> ${staffuser.globalName} ( <@${existingCase.Staff.UserID}> )

<:staffplayer:1165300274399805461> **Player Name**
> ${caseData.IGN}

<:staffpaper:1165300346202095618> **Reason**
> ${caseData.Reason}

<:staffurl:1165300470517092413> **Evidence**
> ${caseData.Evidence}

<:staffnumber:1165300421124956270> **Case**
> ${caseData.CaseID}
`;
          }
          const caseInfo = new EmbedBuilder()
            .setTitle(`Case Information - ${caseData.platform}`)
            .setColor('#FF8C00')
            .setDescription(desc)
       .setTimestamp()
        .setFooter({ text: servername, iconURL: client.user.displayAvatarURL() });

          return interaction.reply({ embeds: [caseInfo] });
        }
      }

      return interaction.reply({ content: 'Case not found.', ephemeral: true });
    } catch (e) {
      console.log(e);
      return interaction.reply({ content: 'An error occurred while retrieving case information.', ephemeral: true });
    }
  },
};
