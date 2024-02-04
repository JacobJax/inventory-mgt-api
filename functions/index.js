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

const {addItemValidation, updateItemValidation, moveItemValidation, restockItemValidation} = require("./validators/itemsValidator");

const app = express();

const authMiddleware = require("./middlewares/authMiddleware");
app.use(authMiddleware);

const admin = require("firebase-admin");
admin.initializeApp();

app.get("/", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("inventory").get();

    const items = [];
    snapshot.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();

      items.push({id, ...data});
    });

    res.status(200).send(JSON.stringify(items));
  } catch (error) {
    res.status(500).send(JSON.stringify({"error": error}));
  }
});

app.post("/", async (req, res) => {
  const item = req.body;

  // validate user input
  const {error} = addItemValidation(item);
  if (error) return res.status(400).json(error.details[0].message);

  try {
    await admin.firestore().collection("inventory").add(item);
    res.status(201).send(JSON.stringify(item));
  } catch (error) {
    res.status(500).send(JSON.stringify({"error": error}));
  }
});

app.route("/:id")
    .get(async (req, res) => {
      try {
        const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();

        // return error if item is not found
        if (!snapshot.exists) {
          return res.status(404).send(JSON.stringify({"error": "item not found"}));
        }

        // create item format
        const itemId = snapshot.id;
        const itemData = snapshot.data();

        res.status(200).send(JSON.stringify({itemId, ...itemData}));
      } catch (error) {
        res.status(500).send(JSON.stringify({"error": error}));
      }
    })
    .put(async (req, res) => {
      try {
        const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();
        // return error if item is not found
        if (!snapshot.exists) {
          return res.status(404).send(JSON.stringify({"error": "item not found"}));
        }
        const data = snapshot.data();

        // validate user input
        const {error} = updateItemValidation(req.body);
        if (error) return res.status(400).json(error.details[0].message);

        const postBody = {
          "storage_shelf_column_number": req.body.storage_shelf_column_number ? req.body.storage_shelf_column_number : data.storage_shelf_column_number,
          "quantity": req.body.quantity ? req.body.quantity : data.quantity,
          "shop_price": req.body.shop_price ? req.body.shop_price : data.shop_price,
          "shop_billing_type": req.body.shop_billing_type ? req.body.shop_billing_type : data.shop_billing_type,
          "name": req.body.name ? req.body.name : data.name,
          "slug": req.body.slug ? req.body.slug : data.slug,
          "storage_shelf_row_number": req.body.storage_shelf_row_number ? req.body.storage_shelf_row_number : data.storage_shelf_row_number,
          "storage_quantification_type": req.body.storage_quantification_type ? req.body.storage_quantification_type : data.storage_quantification_type,
        };

        await admin.firestore().collection("inventory").doc(req.params.id).update(postBody);

        res.status(200).send(JSON.stringify({"message": "Item updated successfully"}));
      } catch (error) {
        res.status(500).send(JSON.stringify({"error": error}));
      }
    })
    .delete(async (req, res) => {
      try {
        // Get item from database
        const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();

        // return error if item is not found
        if (!snapshot.exists) {
          return res.status(404).send(JSON.stringify({"error": "item not found"}));
        }

        // delete item
        await admin.firestore().collection("inventory").doc(req.params.id).delete();
        res.status(200).send(JSON.stringify({"message": "Item deleted succesfully"}));
      } catch (error) {
        res.status(500).send(JSON.stringify({"error": error}));
      }
    });


// move item
app.put("/:id/move", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();
    // return error if item is not found
    if (!snapshot.exists) {
      return res.status(404).send(JSON.stringify({"error": "item not found"}));
    }
    const data = snapshot.data();

    // validate user input
    const {error} = moveItemValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const postBody = {
      "storage_shelf_column_number": req.body.storage_shelf_column_number ? req.body.storage_shelf_column_number : data.storage_shelf_column_number,
      "storage_shelf_row_number": req.body.storage_shelf_row_number ? req.body.storage_shelf_row_number : data.storage_shelf_row_number,
    };

    await admin.firestore().collection("inventory").doc(req.params.id).update(postBody);

    res.status(200).send(JSON.stringify({"message": "Item moved successfully"}));
  } catch (error) {
    res.status(500).send(JSON.stringify({"error": error}));
  }
});

// restock item
app.put("/:id/restock", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("inventory").doc(req.params.id).get();
    // return error if item is not found
    if (!snapshot.exists) {
      return res.status(404).send(JSON.stringify({"error": "item not found"}));
    }
    const data = snapshot.data();

    // validate user input
    const {error} = restockItemValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const postBody = {
      "quantity": req.body.quantity + data.quantity,
    };

    await admin.firestore().collection("inventory").doc(req.params.id).update(postBody);

    res.status(200).send(JSON.stringify({"message": "Item restocked successfully"}));
  } catch (error) {
    res.status(500).send(JSON.stringify({"error": error}));
  }
});

exports.inventory = onRequest(app);
