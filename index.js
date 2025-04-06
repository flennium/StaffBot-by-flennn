const { Client, Events, GatewayIntentBits, Partials, Collection } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { token, mongoDatabaseUri } = require("./configs/serverinfo.json");

process.on('unhandledRejection', (reason, p) => {
  console.log(reason);
});

process.on('uncaughtException', (err, origin) => {
  console.log(err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.log(err);
});


const client = new Client({
  intents: [Object.values(GatewayIntentBits)],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
  allowedMentions: {
    repliedUser: false,
  },
});

client.slashCommands = new Collection();
client.events = new Collection();
client.aliases = new Collection();
client.commands = new Collection();

client.once('ready', () => {
  console.log(`${client.user.tag} is ready!`);
});


const loadHandlers = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      loadHandlers(filePath); 
    } else {
      const handler = require(filePath);
      handler(client);
    }
  });
};

loadHandlers(path.join(__dirname, 'handlers'));

client.login(token);

const mongoose = require('mongoose');

mongoose.connect(mongoDatabaseUri, {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});



module.exports = {
  client,
};