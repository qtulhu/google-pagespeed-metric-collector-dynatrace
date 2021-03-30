const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fetch = require("node-fetch");
const https = require("https");
const config = require("./node_modules/lighthouse/lighthouse-core/config/lr-desktop-config");
const mConfig = require("./node_modules/lighthouse/lighthouse-core/config/lr-mobile-config");

const urlWebSite = "https://yourwebsite.com";
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const launchChromeAndRunLighthouse = (url) => {
  return chromeLauncher
    .launch({
      chromeFlags: [
        "--no-first-run",
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
      ],
    })
    .then((chrome) => {
      const opts = {
        port: chrome.port,
      };
      return lighthouse(url, opts, config).then((results) => {
        return chrome.kill().then(() => {
          return {
            js: results.lhr,

            json: results.report,
          };
        });
      });
    });
};
const mLaunchChromeAndRunLighthouse = (url) => {
  return chromeLauncher
    .launch({
      chromeFlags: [
        "--no-first-run",
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
      ],
    })
    .then((chrome) => {
      const opts = {
        port: chrome.port,
      };
      return lighthouse(url, opts, mConfig).then((results) => {
        return chrome.kill().then(() => {
          return {
            js: results.lhr,

            json: results.report,
          };
        });
      });
    });
};

async function dataPosting(data, urlPost) {
  try {
    const response = await fetch(urlPost, {
      method: "POST",
      agent,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();
    console.log("Success:", JSON.stringify(json));
    console.log(JSON.stringify(data));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function testWebSite() {
  console.log("=============================================");
  console.log(new Date());

  console.log(urlWebSite);

  console.log("=============================================");

  const urlPost =
    "https://<IP/domain>/e/<environment id>/api/v1/entity/infrastructure/custom/<custom device name>%20Metrics?Api-Token=<token>";
  const murlPost =
    "https://<IP/domain>/e/<environment id>/api/v1/entity/infrastructure/custom/<mobile custom device name>%20Metrics?Api-Token=<token>;

  await launchChromeAndRunLighthouse(urlWebSite).then((results) => {
    let dataResult = JSON.parse(results.json);

    let speedindexValue = dataResult.audits["speed-index"].numericValue;
    let firstContPaintValue =
      dataResult.audits["first-contentful-paint"].numericValue;
    let interactiveValue = dataResult.audits.interactive.numericValue;
    let largContPaintValue =
      dataResult.audits["largest-contentful-paint"].numericValue;

    const data = {
      tags: ["default"],
      type: "default",

      series: [
        {
          timeseriesId: "custom:speed-index",
          dimensions: { "GooglePageSpeed": "<Custom device name>" },

          dataPoints: [[Date.now(), speedindexValue]],
        },
        {
          timeseriesId: "custom:first-contentful-paint",
          dimensions: { "GooglePageSpeed": "<Custom device name>" },

          dataPoints: [[Date.now(), firstContPaintValue]],
        },
        {
          timeseriesId: "custom:interactive",
          dimensions: { "GooglePageSpeed": "<Custom device name>" },

          dataPoints: [[Date.now(), interactiveValue]],
        },
        {
          timeseriesId: "custom:largest-contentful-paint",
          dimensions: { "GooglePageSpeed": "<Custom device name>" },

          dataPoints: [[Date.now(), largContPaintValue]],
        },
      ],
    };

    dataPosting(data, urlPost);
  });
  await mLaunchChromeAndRunLighthouse(urlWebSite).then((results) => {
    let dataResult = JSON.parse(results.json);

    let speedindexValue = dataResult.audits["speed-index"].numericValue;
    let firstContPaintValue =
      dataResult.audits["first-contentful-paint"].numericValue;
    let interactiveValue = dataResult.audits.interactive.numericValue;
    let largContPaintValue =
      dataResult.audits["largest-contentful-paint"].numericValue;

    const data = {
      tags: ["default"],
      type: "default",

      series: [
        {
          timeseriesId: "custom:speed-index",
          dimensions: { "GooglePageSpeed": "<Mobile custom device name>" },

          dataPoints: [[Date.now(), speedindexValue]],
        },
        {
          timeseriesId: "custom:first-contentful-paint",
          dimensions: { "GooglePageSpeed": "<Mobile custom device name>" },

          dataPoints: [[Date.now(), firstContPaintValue]],
        },
        {
          timeseriesId: "custom:interactive",
          dimensions: { "GooglePageSpeed": "<Mobile custom device name>" },

          dataPoints: [[Date.now(), interactiveValue]],
        },
        {
          timeseriesId: "custom:largest-contentful-paint",
          dimensions: { "GooglePageSpeed": "<Mobile custom device name>" },

          dataPoints: [[Date.now(), largContPaintValue]],
        },
      ],
    };

    dataPosting(data, murlPost);
  });
}

function repeatTest() {
  return new Promise(async (resolve, reject) => {
    try {
      await testWebSite();
    } catch (error) {
      console.error(error);
    }
    console.log("last");
    await repeatTest();
    resolve();
  });
}

setTimeout(repeatTest, 1000);
