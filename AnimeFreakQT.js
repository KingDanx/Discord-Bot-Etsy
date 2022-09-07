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
let oldShopInfo;
let timer = 0;

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
      //log(res.data);
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

  //get new info on interval
  setInterval(() => {
    getShopInfo();
    timer++;
    console.log(`Checked for updated data ${timer} time(s)`);
  }, 60 * 10000);

  setInterval(() => {
    if (!oldShopInfo) {
      oldShopInfo = shopInfo;
    }

    if (shopInfo.transaction_sold_count != oldShopInfo.transaction_sold_count) {
      testMsg.send(
        `@everyone NEW SALE!!
        \n-Shop Name:  ${shopInfo.shop_name} 
        \n-Units Sold: ${shopInfo.transaction_sold_count}`
      );
      oldShopInfo = shopInfo;
    }
  }, 60 * 10000);
});

setInterval(() => {
  if (!oldShopInfo) {
    oldShopInfo = shopInfo;
  }

  if (shopInfo.review_count != oldShopInfo.review_count) {
    testMsg.send(
      `@everyone NEW Review!!
        \n-Shop Name:  ${shopInfo.shop_name} 
        \n-Reviews:    ${shopInfo.review_count}
        \n-Rating:     ${shopInfo.review_average} stars`
    );
    oldShopInfo = shopInfo;
  }
}, 60 * 10000);

client.on("messageCreate", (message) => {
  if (!message.author.bot) {
    if (
      (message.guild == process.env.TAINTED_SOULS_GENERAL &&
        message.author.id == "203652156467838976") ||
      message.author.id == "182654957466419201"
    ) {
      message.reply(mockSpeak(message.content, message));
    } else if (message.guild == process.env.TAINTED_SOULS_GENERAL) {
      message.reply(`Hmmmm, ${message.content}, very interesting`);
    }
  }
});

client.login(token);
