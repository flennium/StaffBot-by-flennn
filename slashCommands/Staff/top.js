const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const StaffModel = require('../../models/CasesData');
const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json");

module.exports = {
  name: 'top',
  description: 'Display the Staff Points leaderboard.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'platform',
      description: 'The platform for which you want to retrieve the top staff members.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'MINECRAFT', value: 'MINECRAFT' },
        { name: 'DISCORD', value: 'DISCORD' },
        { name: 'COMPENSATION', value: 'COMPENSATION' },
        { name: 'TICKETS', value: 'TICKETS' },
        { name: 'ALL', value: 'ALL' }, 
      ],
    },
  ],
  run: async (client, interaction) => {
    const platform = interaction.options.getString('platform').toUpperCase();
    const staffRoles = [staffrole];
    const hasStaffRole = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasStaffRole) {
      return interaction.reply({ content: ':x: You need to be a staff to use this command.', ephemeral: true });
    }

    let emoji;
    if (platform === 'MINECRAFT') {
      emoji = '<:staffminecraft:1165652133635432489> ';
    } else if (platform === 'DISCORD') {
      emoji = '<:staffdiscord:1165652417954713671> ';
    } else if (platform === 'COMPENSATION') {
      emoji = '✉';
    } else if (platform === 'TICKETS') {
      emoji = '🎫';
    } else if (platform === 'ALL') {
      emoji = '🌟';
    }

    try {
      let staffList;

      if (platform === 'ALL') {
        staffList = await StaffModel.aggregate([
          {
            $project: {
              'Staff.UserID': 1,
              totalPoints: {
                $add: [
                  { $ifNull: [{ $arrayElemAt: ['$Staff.Points.discord', 0] }, 0] },
                  { $ifNull: [{ $arrayElemAt: ['$Staff.Points.minecraft', 0] }, 0] },
                  { $ifNull: [{ $arrayElemAt: ['$Staff.Points.compensation', 0] }, 0] },
                  { $ifNull: [{ $arrayElemAt: ['$Staff.Points.tickets', 0] }, 0] },
                ],
              },
            },
          },
          { $sort: { totalPoints: -1 } },
          { $limit: 10 },
        ]);
      } else {
        const platformField = `Staff.Points.${platform.toLowerCase()}`;
        staffList = await StaffModel.aggregate([
          {
            $project: {
              'Staff.UserID': 1,
              platformPoints: { $arrayElemAt: [`$Staff.Points.${platform.toLowerCase()}`, 0] },
            },
          },
          { $sort: { platformPoints: -1 } },
          { $limit: 10 },
        ]);
      }

      if (staffList.length === 0) {
        return interaction.reply({ content: `No staff members found for platform ${platform}.`, ephemeral: false });
      }

      const leaderboardEmbed = new EmbedBuilder()
        .setTitle(`${emoji}  Top - ${platform}`)
        .setColor('#FF8C00');
      let description = '';

      staffList.forEach((staff, index) => {
        const user = client.users.cache.get(staff.Staff.UserID);
        if (user) {
          let points;
          if (platform === 'ALL') {
            points = staff.totalPoints;
          } else {
            points = staff.platformPoints;
          }
          description += `\`#${index + 1}\` **|**  <@${user.id}> **|**  \`${points || 0}\`\n`;
        }
      });

      leaderboardEmbed.setDescription(description);
       leaderboardEmbed.setTimestamp()
        leaderboardEmbed.setFooter({ text: servername, iconURL: client.user.displayAvatarURL() });

      return interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error(`Error fetching staff leaderboard for platform ${platform}:`, error);
      return interaction.reply({
        content: `An error occurred while fetching the leaderboard for platform ${platform}.`,
        ephemeral: true,
      });
    }
  },
};