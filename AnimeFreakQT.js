const {
  Client,
  GatewayIntentBits,
  Intents,
  TextChannel,
} = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");
const { send } = require("process");
const { time } = require("console");

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

//Send a message
const sendMessage = (message, channel = "232890995597901824") => {
  client.on("ready", (client) => {
    client.channels.cache.get(channel).send(message);
  });
};

const log = (data) => {
  console.log(data + "hafdha;lksdfajhdf");
};

//call an API
const getJoke = async () => {
  await axios
    .get("https://api.chucknorris.io/jokes/random")
    .then((res) => {
      console.log(res.data.value);
      sendMessage(res.data.value);
      return res.data.value;
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      console.log(error.config);
    });
};

client.once("ready", () => {
  console.log(`Bot ${client.user.tag} ready!`);
  const joke = client.channels.cache.get("232890995597901824");
  joke.send(getJoke());
});

client.on("messageCreate", (message) => {
  if (!message.author.bot) {
    message.reply(`Hmmmm, ${message.content}, very interesting`);
    //console.log(message.author)
    //console.log(client.user)
  }
});

//sendMessage("fasdf");
client.login(token);
