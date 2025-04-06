module.exports = (client) => {
  const { EmbedBuilder } = require("discord.js");
  const { prefix } = require("../configs/serverinfo.json");

  client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    let commandName = args.shift().toLowerCase();

    if (message.content.startsWith(prefix)) {
      commandName = commandName.slice(prefix.length).toLowerCase();
    }

    let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

    if (!command) {
      command = client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    }

    if (!command) return;

    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error executing that command.');
    }
  });
}
