const axios = require('axios');
const chalk = require('chalk');
const { AdminVc, guildID, botstatus } = require("../configs/serverinfo.json");
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const CaseModel = require('./../models/CasesData');
const { PresenceUpdateStatus } = require('discord.js');

module.exports = (client) => {
  

  client.on("ready", async () => {
      client.user.setPresence({ activities: [{ name: botstatus }], status: PresenceUpdateStatus.Online });

    //   await deleteAllCaseModels();
  });


    
    
    async function deleteAllCaseModels() {
    try {
      const result = await CaseModel.deleteMany(); 
      console.log(`Deleted ${result.deletedCount} documents from CaseModel.`);
    } catch (error) {
      console.error('Error deleting CaseModel documents:', error);
    }
  }
    
    
    
    
};
