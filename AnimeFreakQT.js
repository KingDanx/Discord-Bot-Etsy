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
let shopInfo;

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
      joke = `@everyone ${res.data.value}`;
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

const getShopInfo = async () => {
  await axios
    .get("https://openapi.etsy.com/v3/application/shops/34937376", {
      headers: {
        "x-api-key": process.env["ETSY_API"],
      },
    })
    .then((res) => {
      log(res.data);
      shopInfo = res.data;
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
  let testMsg = client.channels.cache.get(process.env["ANIMEQT_GENERAL"]);

  //getJoke();
  getShopInfo();

  // setInterval(() => {  get new info on interval
  //   getJoke();
  // }, 5000);

  setInterval(() => {
    //testMsg.send(joke);
    testMsg.send(
      `@everyone \n-Shop Name: ${shopInfo.shop_name} 
      \n-Shop ID:    ${shopInfo.shop_id} 
      \n-Units Sold: ${shopInfo.transaction_sold_count} 
      \n-Shop Info:  ${shopInfo.sale_message} 
      \n-Reviews:    ${shopInfo.review_count} 
      \n-Rating:     ${shopInfo.review_average} stars 
      \n-Website:    ${shopInfo.url}`
    );
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

client.login(token);
