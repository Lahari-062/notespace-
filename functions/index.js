/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// Notespace email OTP bridge
exports.otpBridge = onRequest((req, res) => {
  const allowedOrigins = [
    "http://localhost:5186",
    "http://localhost:5174",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  return (async () => {
    try {
      const serviceUrl = process.env.OTP_SERVICE_URL;

      if (!serviceUrl) {
        throw new Error("OTP service URL is not configured.");
      }

      const { action, idToken, code } = req.body || {};

      if (!idToken || !["send", "verify"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP request.",
        });
      }

      const upstream = await fetch(serviceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ action, idToken, code }),
        redirect: "follow",
      });

      const result = await upstream.json();

      return res.status(200).json(result);
    } catch (error) {
      logger.error("OTP bridge request failed", error);

      return res.status(502).json({
        success: false,
        message: "The OTP service could not complete the request.",
      });
    }
  })();
});