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
    getJoke();
    client.channels.cache.get(channel).send(message);
  });
};

const mockSpeak = (inputArray, inputMessage) => {
  inputArray = inputMessage.content.split("");
  for (let i = 0; i < inputArray.length - 1; i++) {
    if (
      (inputArray[i] % 2 == 0 &&
        inputArray[i - 1] != inputArray[i - 1].toUpperCase()) ||
      (i % 2 == 0 &&
        i > 1 &&
        inputArray[i - 1] != inputArray[i - 1].toUpperCase()) ||
      (inputArray[i - 1] == " " &&
        inputArray[i - 2] == inputArray[i - 2].toLowerCase() &&
        inputArray[i] == inputArray[i].toLowerCase())
    ) {
      inputArray[i] = inputArray[i].toUpperCase();
    } else {
      inputArray[i] = inputArray[i].toLowerCase();
    }
  }
  inputArray = inputArray.join("");
  inputMessage.reply(inputArray);
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

// client.once("ready", () => {
//   console.log(`Bot ${client.user.tag} ready!`);
//   const joke = client.channels.cache.get("232890995597901824");
//   //joke.send("l");
// });

client.on("messageCreate", (message) => {
  if (!message.author.bot) {
    if (
      message.author.id == "203652156467838976" ||
      message.author.id == 182654957466419201
    ) {
      mockSpeak(message.content, message);
      //message.reply(danMessage);
    } else {
      message.reply(`Hmmmm, ${message.content}, very interesting`);
    }
  }
});

//sendMessage("fasdf");
client.login(token);
