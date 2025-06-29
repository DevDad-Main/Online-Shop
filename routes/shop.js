const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");

// Starting Page
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// Adding the :id or whatever the variable name will be dynamic.
// Then we also exxtract those details later.
// Essentiallyy tells express to look for a route like /products/1
// -> Allowing use to extract the id
router.get("/products/:id", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.get("/orders", shopController.getOrders);

router.get("/checkout", shopController.getCheckout);

module.exports = router;
