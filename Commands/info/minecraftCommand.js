const { EmbedBuilder } = require('discord.js');
const { command, port, ip, mcchannels, servername, offlineemoji, onlineemoji } = require('../../configs/serverinfo.json');
const axios = require('axios');

module.exports = {
  name: 'mcstatus', 
  description: 'Check Minecraft server status',
  aliases: command.aliases, 

  async execute(message, args) {
    if (message.author.bot || !message.id) return;
    
    if (!mcchannels.includes(message.channel.id)) return;

      const apiURL = `https://api.mcsrvstat.us/3/${ip}`;
      
      try {
        const { data } = await axios.get(apiURL);

        let playersOnline, maxPlayers, online, embed;

        if (data.online) {
          playersOnline = data.players.online;
          maxPlayers = data.players.max;
          online = `${onlineemoji} Online`;

          embed = new EmbedBuilder()
            .setTitle(`${servername} `)
            .setDescription(`Java IP: **${ip}**\nBedrock IP: **${ip}:${port}**\n\n**• ${servername}**\n╰  ${online}\n╰ <:player:1165296512826355793> \`${playersOnline}\`/\`${maxPlayers}\` Players`)
            .setColor('#FF8C00');
        } else {
          playersOnline = 0;
          online = `${offlineemoji} Offline`;

          embed = new EmbedBuilder()
            .setTitle(`${servername} `)
            .setDescription(`\nJava IP: **${ip}**\nBedrock IP: **${ip}:${port}**\n\n**•  ${servername}**\n╰  ${online}\n╰ <:player:1165296512826355793> \`???/????\``)
            .setColor('#FF8C00');
        }

        return message.reply({ embeds: [embed] });
      } catch (error) {
        return message.reply(`Failed to connect to the server API: ${error.message}`);
      }
  },
};
