const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { staffrole, dclogchannel, servername } = require("../../configs/serverinfo.json"); 

module.exports = {
    name: 'dclog',
    description: "Log discord data.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'user',
            description: 'The user mention.',
            type: ApplicationCommandOptionType.User,
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
            description: 'The type of punishment (MUTE, BAN, TIMEOUT, KICK).',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'MUTE', value: 'MUTE' },
                { name: 'BAN', value: 'BAN' },
                { name: 'TIMEOUT', value: 'TIMEOUT' },
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
        const playerName = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const punishmentType = interaction.options.getString('type');
        const duration = interaction.options.getString('duration');
        const proofurl = interaction.options.getString('proof-url');
        const prooffile = interaction.options.getAttachment('proof-file');

        const currentTimestamp = new Date().getTime();

        if (!interaction.member.roles.cache.has(staffrole)) {
            return interaction.reply({ content: '❌ You need to be a staff to use this command.', ephemeral: true });
        }

        let evidence;
        if (prooffile && proofurl) {
            return interaction.reply({ content: "❌ You can't provide both types of evidence. Please choose one.", ephemeral: true });
        } else if (prooffile) {
            evidence = prooffile.proxyURL;
        } else if (proofurl) {
            evidence = proofurl;
        } else {
            return interaction.reply({ content: "❌ You need to provide at least one piece of evidence.", ephemeral: true });
        }

        try {
            const existingCase = await CaseModel.findOne({ 'Staff.UserID': DiscordStaff.id });
            const allStaff = await CaseModel.find();
            const totalCases = allStaff.reduce((sum, staffMember) => sum + staffMember.Staff.cases.length, 0);
            let CaseID = totalCases + 1;

            if (existingCase) {
                const updatedCase = {
                    platform: "DISCORD",
                    IGN: playerName.username,
                    Reason: reason,
                    PunishmentType: punishmentType,
                    Timestamp: currentTimestamp,
                    duration: duration,
                    Evidence: evidence,
                    CaseID,
                };

                existingCase.Staff.Points[0].discord += 1;
                existingCase.Staff.cases.push(updatedCase);
                await existingCase.save();
            } else {
                const newCase = new CaseModel({
                    Staff: {
                        UserID: DiscordStaff.id,
                        Points: [{ discord: 1, minecraft: 0, compensation: 0 }],
                        cases: [{
                            platform: "DISCORD",
                            IGN: playerName.username,
                            Reason: reason,
                            PunishmentType: punishmentType,
                            Timestamp: currentTimestamp,
                            duration: duration,
                            Evidence: evidence,
                            CaseID,
                        }],
                    },
                });
                await newCase.save();
            }

            const dclog = new EmbedBuilder()
                .setTitle(`<:staffdiscord:1165652417954713671> Punishment Log - Discord ${punishmentType}`)
                .setColor('#FF8C00')
                .setDescription(`
<:staffstar:1165300131982233640> **Staff**
> ${DiscordStaff.globalName} ( <@${DiscordStaff.id}> )

<:staffplayer:1165300274399805461> **Username**
> ${playerName}

<:staffpaper:1165300346202095618> **Reason**
> ${reason}

<:stafftime:1165300397049663559> **Punishment**
> ${punishmentType} | ${duration}

<:staffurl:1165300470517092413> **Evidence**
> ${evidence}

<:staffnumber:1165300421124956270> **Case**
> ${CaseID}
`)
                .setTimestamp()
                .setFooter({ text: servername, iconURL: client.user.displayAvatarURL() });

            const logChannel = client.channels.cache.get(dclogchannel);
            if (!logChannel) {
                return interaction.reply({ content: '❌ Could not find the logging channel. Please check the configuration.', ephemeral: true });
            }

            await logChannel.send({ embeds: [dclog] });

            return interaction.reply({ content: `✅ Discord log has been sent to <#${dclogchannel}> (Case ID: ${CaseID}).`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ An error occurred while saving case information. Please try again later.', ephemeral: true });
        }
    }
};
