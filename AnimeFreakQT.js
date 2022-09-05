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

let joke;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

//Send a message
// const sendMessage = (message, channel = "232890995597901824") => {
//   client.on("ready", (client) => {
//     client.channels.cache.get(channel).send(message);
//   });
// };

const mockSpeak = (inputArray, inputString) => {
  inputArray = inputString.content.split("");
  for (let i = 0; i < inputArray.length - 1; i++) {
    i % 2 == 0
      ? (inputArray[i] = inputArray[i].toUpperCase())
      : (inputArray[i] = inputArray[i].toLowerCase());
  }
  inputArray = inputArray.join("");
  return inputArray;
};

const log = (data) => {
  console.log(data);
};

//call an API
const getJoke = async () => {
  await axios
    .get("https://api.chucknorris.io/jokes/random")
    .then((res) => {
      joke = res.data.value;
      log(res.data.value);
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
    })
    .then(() => {
      return joke;
    });
};

client.once("ready", () => {
  let counter = 1;
  console.log(`Bot ${client.user.tag} ready!`);
  let testMsg = client.channels.cache.get("232890995597901824");

  getJoke();

  setInterval(() => {
    getJoke();
  }, 5000);

  setInterval(() => {
    testMsg.send(joke);
    counter++;
  }, 5000);
});

client.on("messageCreate", (message) => {
  if (!message.author.bot) {
    if (
      message.author.id == "203652156467838976" ||
      message.author.id == "182654957466419201"
    ) {
      message.reply(mockSpeak(message.content, message));
    } else {
      message.reply(`Hmmmm, ${message.content}, very interesting`);
    }
  }
});

//sendMessage("fasdf");
client.login(token);
