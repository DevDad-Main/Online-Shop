import { Product } from "../models/product.models.js";
import { Order } from "../models/order.models.js";
import { errorWrapper } from "../util/errorWrapper.util.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ITEMS_PER_PAGE = 1;

//#region Get Products
export function getProducts(req, res, next) {
  //INFO: Find here does not return us a cursor it returns us all the products
  //WARN: We should turn this into a cursor when working with large amounts of data, or manipulate .find() to limit the data returned using pagination
  //
  const page = +req.query.page || 1; // Adding a + to convert to a numbers
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProduct) => {
      totalItems = numProduct;
      return (
        Product.find()
          // Allows us to skip a certain amount of documents
          // Taking into account the previous pages
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => errorWrapper(next, err));
}
//#endregion

//#region Get Product
export function getProduct(req, res, next) {
  // This has to be exactly the same as we defined in the route :id
  // Allowing us to extract it from the url parameters
  //INFO: mongoose comes with a findById so we dont need to change the function called
  const prodID = req.params.productId;
  Product.findById(prodID)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => errorWrapper(next, err));
}
//#endregion

//#region Get Index
export function getIndex(req, res, next) {
  // fetching the page number and then limit amount of data shown
  const page = +req.query.page || 1; // Adding a + to convert to a numbers
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProduct) => {
      totalItems = numProduct;
      return (
        Product.find()
          // Allows us to skip a certain amount of documents
          // Taking into account the previous pages
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Cart
export async function getCart(req, res, next) {
  await req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      console.log(products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => errorWrapper(next, err));
}
//#endregion

//#region Post Cart
export function postCart(req, res, next) {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => errorWrapper(next, err));
  // Assigning req.user to a newely instantiated object allowing us to access the methods of User.
  // Now we can call methods on req.user
}
//#endregion

//#region Post Cart Delete
export function postCartDeleteProduct(req, res, next) {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Post Order
export async function postOrder(req, res, next) {
  await req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      //INFO: Remapping our returned products to a newer easier to work with object as everything is nested differently to what the order fields require
      const products = user.cart.items.map((i) => {
        //INFO: Using the _doc mongoose gives us to all of the data inside, spread operator to pull out all of the data and store it in a new object
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id, // mongoose picks the id automatically
        },
        products: products,
      });
      return order.save();
    })
    .then((results) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders"); // Once we have claered the above cart then we redirect
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Checkout Success
export async function getCheckoutSuccess(req, res, next) {
  await req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      //INFO: Remapping our returned products to a newer easier to work with object as everything is nested differently to what the order fields require
      const products = user.cart.items.map((i) => {
        //INFO: Using the _doc mongoose gives us to all of the data inside, spread operator to pull out all of the data and store it in a new object
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id, // mongoose picks the id automatically
        },
        products: products,
      });
      return order.save();
    })
    .then((results) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders"); // Once we have claered the above cart then we redirect
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Checkout
export async function getCheckout(req, res, next) {
  let products;
  let total = 0;
  await req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: products.map((p) => {
          return {
            price_data: {
              currency: "gbp",
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
            },
            quantity: p.quantity,
          };
        }),
        customer_email: req.user.email,
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        totalSum: total,
        products: products,
        pk_test_key: process.env.STRIPE_PUBLISHABLE_KEY,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Orders
export function getOrders(req, res, next) {
  //INFO: Should return us all orders that belong to user that matches the users id (The User logged in)
  Order.find({
    "user.userId": req.user._id,
  })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Invoice
export function getInvoice(req, res, next) {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No Order Found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      // Once we pass the above checks then we know the user is allowed to see the invoice as it is theirs
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("src", "data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=" + invoiceName + "",
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("------------------------------");
      let totalPrice = 0;
      order.products.forEach((p) => {
        totalPrice += p.quantity * p.product.price;
        pdfDoc
          .fontSize(14)
          .text(p.product.title + " - " + p.quantity + " x " + p.product.price);
      });
      pdfDoc.text("----------------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end();

      //#region INFO: Old code only suited for small files but this will cause issues if we have bigger files or have hundreds of requests. Overflow of memory. Switching to streaming the data
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     "inline; filename=" + invoiceName + "",
      //   );
      //   // res.setHeader(
      //   //   "Content-Disposition",
      //   //   'attachment; filename="' + invoiceName + '"',
      //   // );
      //   res.send(data);
      // });
      //#endregion

      //#region Streaming data
      // const file = fs.createReadStream(invoicePath);
      // file.pipe(res);
      //#endregion
    })
    .catch((err) => next(err));
}
//#endregion
