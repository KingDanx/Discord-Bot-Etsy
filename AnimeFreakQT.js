const {
  Client,
  GatewayIntentBits,
  Intents,
  TextChannel,
} = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

let etsyToken;
let refreshToken;
let shopInfo;
let oldShopInfo;
let orderInfo;
let oldOrderInfo;
let timer = 0;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const getFormatDate = () => {
  let date = new Date();
  let formatDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  return formatDate;
};

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

const getNewEtsyToken = async () => {
  let params = new URLSearchParams();
  try {
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env["ETSY_API"]);
    params.append("refresh_token", process.env["REFRESH_TOKEN"]);
    await axios
      .post(`https://api.etsy.com/v3/public/oauth/token`, params, {
        headers: {
          "x-api-key": process.env["ETSY_API"],
        },
      })
      .then((res) => {
        refreshToken = res.data.refresh_token;
        etsyToken = res.data.access_token;
        console.log(res.data);
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
  } catch {
    params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env["ETSY_API"]);
    params.append("refresh_token", refreshToken);
    await axios
      .post(`https://api.etsy.com/v3/public/oauth/token`, params, {
        headers: {
          "x-api-key": process.env["ETSY_API"],
        },
      })
      .then((res) => {
        refreshToken = res.data.refresh_token;
        etsyToken = res.data.access_token;
        console.log(res.data);
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
  }
};

const getShopInfo = async () => {
  await axios
    .get(
      `https://openapi.etsy.com/v3/application/shops/${process.env["ANIMEFREAKQT_SHOP_ID"]}`,
      {
        headers: {
          "x-api-key": process.env["ETSY_API"],
          authorization: `${process.env["TOKEN_TYPE"]} ${process.env["ACCESS_TOKEN"]}`,
        },
      }
    )
    .then((res) => {
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

const getOrderInfo = async () => {
  await axios
    .get(
      `https://openapi.etsy.com/v3/application/shops/${process.env["ANIMEFREAKQT_SHOP_ID"]}/receipts`,
      {
        headers: {
          "x-api-key": process.env["ETSY_API"],
          authorization: "Bearer " + process.env["ACCESS_TOKEN"],
        },
      }
    )
    .then((res) => {
      orderInfo = res.data;
      console.log(orderInfo);
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

  getNewEtsyToken();
  //getOrderInfo();
  //getShopInfo();

  //get new info on interval
  setInterval(() => {
    try {
      getOrderInfo();
      getShopInfo();
    } catch {
      getNewEtsyToken();
    }
    timer++;
    console.log(`Checked for updated data ${timer} time(s)`);
  }, 60 * 1000);

  setInterval(() => {
    if (!oldOrderInfo) {
      oldOrderInfo = orderInfo;
    }

    if (orderInfo.results.length > oldOrderInfo.results.length) {
      testMsg.send(
        `@everyone NEW SALE!!

        \n- 
        \n-Units Sold: ${shopInfo.transaction_sold_count}`
      );
      oldShopInfo = shopInfo;
    }
  }, 60 * 1000);
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
}, 60 * 1000);

client.on("messageCreate", (message) => {
  if (!message.author.bot) {
    if (
      (message.guild == process.env.TAINTED_SOULS_GENERAL &&
        message.author.id == process.env["MY_ID"]) ||
      message.author.id == process.env["BABOOM"]
    ) {
      message.reply(mockSpeak(message.content, message));
    } else if (message.guild == process.env.TAINTED_SOULS_GENERAL) {
      message.reply(`Hmmmm, ${message.content}, very interesting`);
    }
  }
});

client.login(process.env["TOKEN"]);
