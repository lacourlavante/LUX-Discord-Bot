const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require("openai");
require('dotenv').config();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Discord bot client with intents to monitor member activity, messages, and interactions
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // For monitoring new members joining the server
  ],
});

// Debugging: Log bot startup
client.once('ready', () => {
  console.log(`🧠 LUX is online as ${client.user.tag}`);
});

// Debugging: Handle new member joins
client.on('guildMemberAdd', async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome'); // Replace with your desired channel name
  if (!welcomeChannel) return;

  const introMessage = `Welcome to the server, ${member.user.username}! I'm LUX, your cosmic guide. 🌟 Please introduce yourself and check out the rules!`;

  // Send the welcome message in a channel
  welcomeChannel.send(introMessage);

  // Send a DM to the new member
  member.send("Welcome to the server! Please introduce yourself in the #introductions channel. 😊");

  // Optionally assign a "New Member" role
  const newMemberRole = member.guild.roles.cache.find(role => role.name === "New Member");
  if (newMemberRole) {
    await member.roles.add(newMemberRole);
  }

  // Reminder if they haven't introduced themselves in an hour
  setTimeout(() => {
    member.send("Hey, we noticed you haven’t introduced yourself yet! Please take a moment in the #introductions channel to say hi! 😊");
  }, 60 * 60 * 1000); // 1 hour reminder
});

// Listen for messages (AI-powered interactions and onboarding questions)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  console.log(`LUX heard: ${message.content}`);

  // Respond to !lux command
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

  // Auto-respond to common onboarding questions
  const lowerCaseMessage = message.content.toLowerCase();
  if (lowerCaseMessage.includes('how do i get started?')) {
    message.reply("To get started, check out the #introductions channel and tell us a little about yourself! 😊");
  }

  if (lowerCaseMessage.includes('what are the server rules?')) {
    message.reply("Please read the pinned messages in the #rules channel for our guidelines. Thanks! 🙌");
  }

  // Handle introduction command: !introduce
  if (lowerCaseMessage.startsWith('!introduce')) {
    const intro = message.content.replace('!introduce', '').trim();
    if (!intro) return message.reply("Please introduce yourself properly!");

    // Assign the "Introduced" role
    const role = message.guild.roles.cache.find(r => r.name === "Introduced");
    if (role) {
      await message.member.roles.add(role);
    }

    message.reply(`Thanks for the introduction, ${message.author.username}! You're now part of the "Introduced" group. 🎉`);
  }

  // Bad word moderation (example, you can add more words)
  const badWords = ['badword1', 'badword2'];
  if (badWords.some(word => message.content.toLowerCase().includes(word))) {
    message.reply("Please refrain from using inappropriate language. You've been warned!");
    await message.member.kick(); // Kick user for violating rule
  }
});

// Log in using the bot's token
client.login(process.env.DISCORD_TOKEN);

// Debugging: Handling errors globally
process.on('unhandledRejection', error => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});
