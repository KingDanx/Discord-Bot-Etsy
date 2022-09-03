const { Client, GatewayIntentBits, Intents } = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const token = process.env["TOKEN"];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`Bot ${client.user.tag} ready!`);
});

client.on("messageCreate", (message) => {
  if (message.content == "test" && message.author.id !== client.user.id) {
    message.reply("pong");
    //console.log(message.author)
    //console.log(client.user)
  }
});

client.login(token);
