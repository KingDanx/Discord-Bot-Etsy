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
let listingInfo;
let timer = 0;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const getFormatDate = (date = null) => {
  if (date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  } else {
    let date = new Date();
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
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
    params.append(
      "refresh_token",
      refreshToken ? refreshToken : process.env["REFRESH_TOKEN"]
    );

    const res = await axios.post(
      `https://api.etsy.com/v3/public/oauth/token`,
      params,
      {
        headers: {
          "x-api-key": process.env["ETSY_API"],
        },
      }
    );

    refreshToken = res.data.refresh_token;
    etsyToken = res.data.access_token;
  } catch (e) {
    if (e.response) {
      console.log(e.response.data);
      console.log(e.response.status);
      console.log(e.response.headers);
    } else if (e.request) {
      console.log(e.request);
    } else {
      console.log("Error", e.message);
    }

    params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env["ETSY_API"]);
    params.append("refresh_token", refreshToken);
    axios
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
      `https://openapi.etsy.com/v3/application/shops/${process.env["ANIMEFREAKQT_SHOP_ID"]}/reviews?limit=100`,
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

const getShopListings = () => {
  axios
    .get(
      `https://openapi.etsy.com/v3/application/shops/${process.env.ANIMEFREAKQT_SHOP_ID}/listings/active`,
      {
        headers: {
          "x-api-key": process.env["ETSY_API"],
          authorization: "Bearer " + etsyToken,
        },
      }
    )
    .then((res) => {
      listingInfo = res.data;
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
    getShopListings();
  }, 10000);

  //update shop listings every 30 minutes
  setInterval(() => {
    getShopListings();
  }, 1000 * 60 * 30);

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
    try {
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
          const shipByDate = new Date(
            orderInfo.results[i].transactions.expected_ship_date
          );
          orderInfo.results[i].transactions.map((el) => {
            if (el?.variations && el?.quantity) {
              itemDescription.push(
                `• ${el.quantity} - ${
                  el.variations.length > 0
                    ? el.variations[0].formatted_value
                    : el.title
                }\n`
              );
            }
          });
          itemDescription = itemDescription.join("");
          orderMsg.send(
            `@everyone **NEW SALE!!** - ${getFormatDate()} - **$${money.toFixed(
              2
            )}**\n\n**Items:**\n${itemDescription}\n**Customer:**\n${
              orderInfo.results[i].formatted_address
            }\n\n**Ship Before:**\n${getFormatDate(shipByDate)}`
          );
        }
        oldOrderInfo = orderInfo;
      }
    } catch (e) {
      orderMsg.send(
        `@everyone **The bot had a boo boo but there should be a new order**\n\n**Error:\n**${e.toString()}`
      );
    }
  }, 45 * 1000);

  //Check for new reviews
  setInterval(() => {
    // let averageRating;
    // let reviewTotal = 0;
    // reviewInfo.results.map((el) => (reviewTotal += el.rating));
    // averageRating = reviewTotal / reviewInfo.results.length;
    // let reviewFilter = listingInfo.results.filter(
    //   (el) => el.listing_id == reviewInfo.results[0].listing_id
    // );
    // let buyerInfo = [];
    // orderInfo.results.map((el) =>
    //   el.buyer_user_id == reviewInfo.results[0].buyer_user_id
    //     ? buyerInfo.push(el.formatted_address)
    //     : null
    // );
    // console.log(buyerInfo);
    // reviewMsg.send(
    //   `@everyone **NEW REVIEW!!** - ${getFormatDate()} - **Total Reviews:** ${
    //     reviewInfo.results.length
    //   } - **Average Review:** ${averageRating.toFixed(1)}
    //   \n• **Item:** ${reviewFilter[0].title}\n\n• **Rating:** ${
    //     reviewInfo.results[0].rating
    //   } stars\n\n• **Review:** ${
    //     reviewInfo.results[0].review == ""
    //       ? "*Review field left blank by customer*"
    //       : reviewInfo.results[0].review
    //   }\n\n• **Customer:** \n${
    //     buyerInfo.length == 0 ? "*No customer info*" : buyerInfo[0]
    //   }`
    // );
    if (!oldReviewInfo) {
      oldReviewInfo = reviewInfo;
    }
    if (!reviewInfo) {
      return;
    } else if (reviewInfo.count > oldReviewInfo.count) {
      if (reviewInfo.count > oldReviewInfo.count) {
        let newReviewCount = reviewInfo.count - oldReviewInfo.count;
        let averageRating;
        let reviewTotal = 0;
        reviewInfo.results.map((el) => (reviewTotal += el.rating));
        averageRating = reviewTotal / reviewInfo.results.length;

        for (let i = newReviewCount - 1; i >= 0; i--) {
          let buyerInfo = [];
          orderInfo.results.map((el) =>
            el.buyer_user_id == reviewInfo.results[i].buyer_user_id
              ? buyerInfo.push(el.formatted_address)
              : null
          );
          let reviewFilter = listingInfo.results.filter(
            (el) => el.listing_id == reviewInfo.results[i].listing_id
          );
          reviewMsg.send(
            `@everyone **NEW REVIEW!!** - ${getFormatDate()} - **Total Reviews:** ${
              reviewInfo.results.length
            } - **Average Review:** ${averageRating.toFixed(1)}
            \n• **Item:** ${reviewFilter[0].title}\n\n• **Rating:** ${
              reviewInfo.results[i].rating
            } stars\n\n• **Review:** ${
              reviewInfo.results[i].review == ""
                ? "*Review field left blank by customer*"
                : reviewInfo.results[i].review
            }\n\n• **Customer:** \n${
              buyerInfo.length == 0 ? "*No customer info*" : buyerInfo[i]
            }`
          );
        }
        oldReviewInfo = reviewInfo;
        reviewTotal = 0;
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
