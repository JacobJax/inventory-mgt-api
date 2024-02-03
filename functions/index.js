/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");

const app = express();
const admin = require("firebase-admin");
admin.initializeApp();

app.get("/", async (req, res) => {
  const snapshot = await admin.firestore().collection("inventory").get();

  const items = [];
  snapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();

    items.push({id, ...data});
  });

  res.status(200).send(JSON.stringify(items));
});

app.post("/", async (req, res) => {
  const item = req.body;

  await admin.firestore().collection("inventory").add(item);

  res.status(201).send(JSON.stringify(item));
});

app.route("/:id")
    .get(async (req, res) => {
      // eslint-disable-next-line max-len
      const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();
      const itemId = snapshot.id;
      const itemData = snapshot.data();

      res.status(200).send(JSON.stringify({itemId, ...itemData}));
    })
    .put(async (req, res) => {
      // eslint-disable-next-line max-len
      const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();
      const data = snapshot.data();

      const postBody = {
        // eslint-disable-next-line max-len
        "storage_shelf_column_number": req.body.storage_shelf_column_number ? req.body.storage_shelf_column_number : data.storage_shelf_column_number,
        "quantity": req.body.quantity ? req.body.quantity : data.quantity,
        // eslint-disable-next-line max-len
        "shop_price": req.body.shop_price ? req.body.shop_price : data.shop_price,
        // eslint-disable-next-line max-len
        "shop_billing_type": req.body.shop_billing_type ? req.body.shop_billing_type : data.shop_billing_type,
        "name": req.body.name ? req.body.name : data.name,
        "slug": req.body.slug ? req.body.slug : data.slug,
        // eslint-disable-next-line max-len
        "storage_shelf_row_number": req.body.storage_shelf_row_number ? req.body.storage_shelf_row_number : data.storage_shelf_row_number,
        // eslint-disable-next-line max-len
        "storage_quantification_type": req.body.storage_quantification_type ? req.body.storage_quantification_type : data.storage_quantification_type,
      };

      // eslint-disable-next-line max-len
      await admin.firestore().collection("inventory").doc(req.params.id).update(postBody);

      // eslint-disable-next-line max-len
      res.status(200).send(JSON.stringify({"message": "Item updated successfully"}));
    })
    .delete(async (req, res) => {
      await admin.firestore().collection("inventory").doc(req.params.id).delete();
      res.status(200).send(JSON.stringify({"message": "Item deleted succesfully"}));
    });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.inventory = onRequest(app);

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
