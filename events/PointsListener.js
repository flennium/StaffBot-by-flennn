const mongoose = require('mongoose');
const CaseModel = require('./../models/CasesData');
const { AdminVc, guildID, ticketsbotID } = require("../configs/serverinfo.json");

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.id !== ticketsbotID) return;
    if (message.guild.id !== guildID) return;

    if (message.embeds.length > 0) {
      for (const embed of message.embeds) {
        if (!embed) continue;
        const embedDescription = embed.description;
        if (!embedDescription) continue;

        if (embedDescription.startsWith("Ticket Closed by")) {
          const userId = extractUserIdFromMessage(embedDescription);

          if (userId) {
            try {
              const updatedCase = await CaseModel.findOneAndUpdate(
                { 'Staff.UserID': userId },
                { $inc: { 'Staff.$.Points.tickets': 1 } }, 
                {
                  arrayFilters: [{ 'elem.UserID': userId }],
                  new: true,
                  upsert: true, 
                }
              );

              if (!updatedCase) {
                const newCase = new CaseModel({
                  Staff: [
                    {
                      UserID: userId,
                      Points: { tickets: 1 },
                    },
                  ],
                });

                await newCase.save();
                console.log(`Created a new case for user ${userId}.`);
              } else {
                console.log(`Updated tickets points for user ${userId}. ${message.channel.name}`);
              }

              await message.channel.send(`**Added Tickets Points to** <@${userId}>.`);
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    }
  });

  function extractUserIdFromMessage(message) {
    const regex = /<@(\d+)>/;
    const match = message.match(regex);
    return match && match[1] ? match[1] : null;
  }
};