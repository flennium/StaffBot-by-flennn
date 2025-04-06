const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { excuserole, compenrole, staffrole, mclogchannel, servername } = require("../../configs/serverinfo.json");

module.exports = {
  name: 'mclog',
  description: "Log Mc data.",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'playername',
      description: 'The Minecraft in-game name of the player.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the punishment.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'type',
      description: 'The type of punishment (MUTE, BAN, WARN, KICK).',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'MUTE', value: 'MUTE' },
        { name: 'BAN', value: 'BAN' },
        { name: 'WARN', value: 'WARN' },
        { name: 'KICK', value: 'KICK' },
      ],
    },
    {
      name: 'duration',
      description: 'Duration of the punishment.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'proof-file',
      description: 'Evidence for the case (Video).',
      type: 11, 
      required: false,
    },
    {
      name: 'proof-url',
      description: 'Evidence for the case (URL).',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    const DiscordStaff = interaction.user;
    const playerName = interaction.options.getString('playername');
    const reason = interaction.options.getString('reason');
    const punishmentType = interaction.options.getString('type');
    const duration = interaction.options.getString('duration');
    const proofurl = interaction.options.getString('proof-url');
    const prooffile = interaction.options.getAttachment('proof-file');

    const currentTimestamp = new Date().getTime();
    const staffRoles = [staffrole];
    const hasStaffRole = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId));

    if (!hasStaffRole) {
      return interaction.reply({ content: '❌ You need to be a staff to use this command.', ephemeral: true });
    }

    let evidence;
    if (prooffile && proofurl) {
      return interaction.reply({ content: "❌ You can't put two types of evidence.", ephemeral: true });
    } else if (prooffile) {
      evidence = prooffile.proxyURL;
    } else if (proofurl) {
      evidence = proofurl;
    } else if (!prooffile && !proofurl) {
      return interaction.reply({ content: "❌ You need to put at least one evidence.", ephemeral: true });
    }

    const existingCase = await CaseModel.findOne({ 'Staff.UserID': DiscordStaff.id });
    let CaseID;

    try {
      const allStaff = await CaseModel.find();
      let totalCases = 0;
      for (const staffMember of allStaff) {
        if (staffMember) {
          totalCases += staffMember.Staff.cases.length;
        }
      }

      if (existingCase) {
        const updatedCase = {
          platform: "MINECRAFT",
          IGN: playerName,
          Reason: reason,
          PunishmentType: punishmentType,
          Timestamp: currentTimestamp,
          duration: duration,
          Evidence: evidence,
          CaseID: totalCases + 1,
        };
        CaseID = updatedCase.CaseID;

        existingCase.Staff.Points[0].minecraft = existingCase.Staff.Points[0].minecraft + 1;
        existingCase.Staff.cases.push(updatedCase);
        await existingCase.save();
      } else {
        const newCase = new CaseModel({
          Staff: {
            UserID: DiscordStaff.id,
            Points: [{
              discord: 0,
              minecraft: 1,
              compensation: 0,
            }],
            cases: [
              {
                platform: "MINECRAFT",
                IGN: playerName,
                Reason: reason,
                PunishmentType: punishmentType,
                Timestamp: currentTimestamp,
                duration: duration,
                Evidence: evidence,
                CaseID: totalCases + 1,
              },
            ],
          },
        });
        CaseID = newCase.Staff.cases[0].CaseID;

        await newCase.save();
      }

      const mclog = new EmbedBuilder()
        .setTitle(`<:staffminecraft:1165652133635432489> Punishment Log - Minecraft ${punishmentType}`)
        .setColor('#FF8C00')
        .setDescription(`
<:staffstar:1165300131982233640> **Staff**
> ${DiscordStaff.globalName} ( <@${DiscordStaff.id}> )

<:staffplayer:1165300274399805461> **Player Name**
> ${playerName}

<:staffpaper:1165300346202095618> **Reason**
> ${reason}

<:stafftime:1165300397049663559> **Punishment**
> ${punishmentType} | ${duration}

<:stafflink:1165300470517092413> **Evidence**
> ${evidence}

<:staffnumber:1165300421124956270> **Case**
> ${CaseID}
`)
        .setTimestamp()
        .setFooter({ text: servername, iconURL: client.user.displayAvatarURL() });
        
            const logChannel = client.channels.cache.get(mclogchannel);
            if (!logChannel) {
                return interaction.reply({ content: '❌ Could not find the logging channel. Please check the configuration.', ephemeral: true });
            }

            await logChannel.send({ embeds: [mclog] });

            return interaction.reply({ content: `✅ Minecraft log has been sent to <#${mclogchannel}> (Case ID: ${CaseID}).`, ephemeral: true });
    } catch (e) {
      console.log(e);
      return interaction.reply({ content: 'An error occurred while saving case information.', ephemeral: true });
    }
  },
};