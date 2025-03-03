const {
  Client,
  GatewayIntentBits,
  Intents,
  TextChannel,
} = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");
const { randomUUID } = require("crypto");

dotenv.config();

let etsyToken = process.env.ACCESS_TOKEN;
let refreshToken = process.env.REFRESH_TOKEN;
let reviewInfo;
let oldReviewInfo;
let orderInfo = {
  count: 0,
  results: [0],
};
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

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Base64 URL encoding
}

const getNewEtsyToken = async () => {
  let params = new URLSearchParams();
  const codeVerifier = randomUUID() + randomUUID();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  console.log(codeVerifier);
  try {
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env.ETSY_API);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://kingdanx.github.io/etsy-info.html");
    params.append("scope", "transactions_r listings_r");
    params.append("state", "superstate");
    params.append("code_challenge", codeChallenge);
    params.append("code_challenge_method", "S256");
    console.log(params);

    const data = await axios.get(`https://etsy.com/oauth/connect`, { params });
    // await axios
    //   .post(`https://api.etsy.com/v3/public/oauth/token`, params, {
    //     headers: {
    //       "x-api-key": process.env["ETSY_API"],
    //     },
    //   })
    //   .then((res) => {
    //     refreshToken = res.data.refresh_token;
    //     etsyToken = res.data.access_token;
    //   })
    //   .catch((error) => {
    //     if (error.response) {
    //       console.log(error.response.data);
    //       console.log(error.response.status);
    //       console.log(error.response.headers);
    //     } else if (error.request) {
    //       console.log(error.request);
    //     } else {
    //       console.log("Error", error.message);
    //     }
    //     console.log(error.config);
    //   });
  } catch (e) {
    console.log(e);
    // oauth2Token();
  }
};

const refreshEtsyToken = async () => {
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ETSY_API,
    refresh_token: refreshToken,
  }).toString();
  try {
    const { data } = await axios.post(
      `https://api.etsy.com/v3/public/oauth/token`,
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Specify content type
          "x-api-key": process.env["ETSY_API"],
        },
      }
    );

    refreshToken = data.refresh_token;
    etsyToken = data.access_token;
  } catch (e) {
    console.log(e);
  }
};

const oauth2Token = async () => {
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.ETSY_API,
    redirect_uri: "https://kingdanx.github.io/etsy-info.html",
    code: process.env.CODE,
    code_verifier: process.env.CODE_VERIFIER,
  }).toString(); // Convert to application/x-www-form-urlencoded format

  try {
    const { data } = await axios.post(
      `https://api.etsy.com/v3/public/oauth/token`,
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Specify content type
          "x-api-key": process.env["ETSY_API"],
        },
      }
    );

    refreshToken = data.refresh_token;
    etsyToken = data.access_token;
  } catch (error) {
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

const getShopListings = async () => {
  await axios
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

  // getNewEtsyToken();
  etsyToken = process.env.ACCESS_TOKEN;

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
    refreshEtsyToken();
    console.log(`Got new token`);
  }, 45 * 60 * 1000);

  //get new info on interval
  setInterval(() => {
    try {
      getOrderInfo();
      getShopReviews();
    } catch {
      refreshEtsyToken();
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
            orderInfo.results[i].name
          }\n`
        );
      }
      oldOrderInfo = orderInfo;
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

    if (
      message.channelId == process.env.ANIMEQT_ORDER_HISTORY &&
      message.content === "/last_order"
    ) {
      const lastOrder = orderInfo.results[0];
      let money = lastOrder.grandtotal.amount / 100;
      let itemDescription = [];
      lastOrder.transactions.map((el) => {
        itemDescription.push(
          `• ${el.quantity} - ${el.variations[0].formatted_value}\n`
        );
      });
      itemDescription = itemDescription.join("");
      message.reply(
        `@everyone **NEW SALE!!** - ${getFormatDate()} - **$${money.toFixed(
          2
        )}**\n\n**Items:**\n${itemDescription}\n**Customer:**\n${
          lastOrder.name
        }\n`
      );
    }
  }
});

client.login(process.env["TOKEN"]);
