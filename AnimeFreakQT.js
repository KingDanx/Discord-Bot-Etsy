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
let reviewInfo;
let oldReviewInfo;
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

const getShopReviews = async () => {
  await axios
    .get(
      `https://openapi.etsy.com/v3/application/shops/${process.env["ANIMEFREAKQT_SHOP_ID"]}/reviews`,
      {
        headers: {
          "x-api-key": process.env["ETSY_API"],
          authorization: `${process.env["TOKEN_TYPE"]} ${etsyToken}`,
        },
      }
    )
    .then((res) => {
      reviewInfo = res.data;
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
          authorization: "Bearer " + etsyToken,
        },
      }
    )
    .then((res) => {
      orderInfo = res.data;
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
  const orderMsg = client.channels.cache.get(
    process.env["ANIMEQT_ORDER_HISTORY"]
  );
  const reviewMsg = client.channels.cache.get(
    process.env["ANIMEQT_ETSY_REVIEWS"]
  );

  getNewEtsyToken();

  setTimeout(() => {
    getOrderInfo();
    getShopReviews();
  }, 10000);

  //get new token on interval
  setInterval(() => {
    getNewEtsyToken();
    console.log(`Got new token`);
  }, 45 * 60 * 1000);

  //get new info on interval
  setInterval(() => {
    try {
      getOrderInfo();
      getShopReviews();
    } catch {
      getNewEtsyToken();
    }
    timer++;
    console.clear();
    console.log(`Checked for updated data ${timer} time(s)`);
  }, 45 * 1000);

  //Check for new orders on interval
  setInterval(() => {
    if (!oldOrderInfo) {
      oldOrderInfo = orderInfo;
      // let itemDescription = [];
      // let money = orderInfo.results[0].grandtotal.amount / 100;
      // orderInfo.results[0].transactions.map((el) => {
      //   itemDescription.push(
      //     `• ${el.quantity} - ${el.variations[0].formatted_value}\n`
      //   );
      // });
      // itemDescription = itemDescription.join("");
      // orderMsg.send(
      //   `@everyone **NEW SALE!!** - ${getFormatDate()} - **$${money.toFixed(
      //     2
      //   )}**\n\n**Items:**\n${itemDescription}\n**Customer:**\n${
      //     orderInfo.results[0].formatted_address
      //   }`
      // );
    }

    if (orderInfo.count > oldOrderInfo.count) {
      let newOrderCount = orderInfo.count - oldOrderInfo.count;

      for (let i = newOrderCount - 1; i >= 0; i--) {
        let money = orderInfo.results[i].grandtotal.amount / 100;
        let itemDescription = [];
        orderInfo.results[i].transactions.map((el) => {
          itemDescription.push(
            `• ${el.quantity} - ${el.variations[0].formatted_value}\n`
          );
        });
        itemDescription = itemDescription.join("");
        orderMsg.send(
          `@everyone **NEW SALE!!** - ${getFormatDate()} - **$${money.toFixed(
            2
          )}**\n\n**Items:**\n${itemDescription}\n**Customer:**\n${
            orderInfo.results[i].formatted_address
          }\n`
        );
      }
      oldOrderInfo = orderInfo;
    }
  }, 45 * 1000);

  //Check for new reviews
  setInterval(() => {
    if (!oldReviewInfo) {
      oldReviewInfo = reviewInfo;
    }
    if (!reviewInfo) {
      return;
    } else if (reviewInfo.count > oldReviewInfo.count) {
      if (reviewInfo.count > oldReviewInfo.count) {
        let newReviewCount = reviewInfo.count - oldReviewInfo.count;

        for (let i = newReviewCount - 1; i >= 0; i--) {
          reviewMsg.send(
            `@everyone NEW REVIEW!! - ${getFormatDate()}
            \n• Rating: ${reviewInfo.results[i].rating}
            \n• Review: ${
              reviewInfo.results[i].review == ""
                ? "*Review field left blank by customer*"
                : reviewInfo.results[i].review
            }`
          );
        }
        oldReviewInfo = reviewInfo;
      }
    }
  }, 45 * 1000);
});

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
