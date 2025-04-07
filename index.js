const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require("openai");
require('dotenv').config();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// On ready, log bot online
client.once('ready', () => {
  console.log(`🧠 LUX is awake as ${client.user.tag}`);
});

// Listen for messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  console.log(`LUX heard: ${message.content}`);

  if (message.content.toLowerCase().startsWith('!lux')) {
    const prompt = message.content.replace(/!lux/i, '').trim();
    if (!prompt) {
      return message.reply("Ask LUX something...");
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      });

      const reply = completion.choices?.[0]?.message?.content?.trim();
      console.log("🛰️ LUX reply:", reply);

      if (reply) {
        message.reply(reply);
      } else {
        message.reply("LUX received static instead of signal.");
      }

    } catch (error) {
      console.error('🚨 LUX encountered an error:', error.response?.data || error.message || error);
      message.reply('LUX failed to reach the Source. Check the stars and try again.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
