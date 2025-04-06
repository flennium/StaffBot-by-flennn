const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
	name: 'ping',
	description: "Check bot's ping.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 3000,
    
	run: async (client, interaction) => {
        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        return interaction.reply(`- Pong! Latency is **${latency}ms**. API Latency is **${apiLatency}ms**.`);
	}
};