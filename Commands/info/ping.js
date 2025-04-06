module.exports = {
  name: 'ping', 
  description: 'Replies with Pong and the bot latency', 
  aliases: ['ms'], 

  async execute(message, args) {
    const latency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    return message.reply(`- Pong! Latency is **${latency}ms**. API Latency is **${apiLatency}ms**.`);
  },
};
