const fs = require('fs');
const chalk = require('chalk');
const AsciiTable = require('ascii-table');
const table = new AsciiTable().setHeading('Message Commands', 'Stats').setBorder('|', '=', '0', '0');

module.exports = async (client) => {
  const messageCommands = [];

  const readDirs = fs.readdirSync('./Commands/');
  await Promise.all(
    readDirs.map(async (dir) => {
      const files = fs.readdirSync(`./Commands/${dir}/`).filter((file) => file.endsWith('.js'));

      for (const file of files) {
        const messageCommand = require(`../Commands/${dir}/${file}`);

        messageCommands.push({
          name: messageCommand.name,
          description: messageCommand.description,
        });

        if (messageCommand.name) {
          client.commands.set(messageCommand.name, messageCommand);
          table.addRow(file.split('.js')[0], '✅');

          if (messageCommand.aliases && Array.isArray(messageCommand.aliases)) {
            messageCommand.aliases.forEach(alias => {
              client.aliases.set(alias, messageCommand.name); 
            });
          }
        } else {
          table.addRow(file.split('.js')[0], '⛔');
        }
      }
    })
  );

  console.log(chalk.red(table.toString()));
  console.log(chalk.yellow('Message Commands • Registered'));
};