const fs = require("fs");
const path = require("path");

const p = path.join(path.dirname(require.main.filename), "data", "cart.json");

module.exports = class Cart {
  // constructor() {
  //   // Contains the objects, the id or quantity of the products
  //   this.products = [];
  //   this.totalPrice = 0;
  // }

  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      // If we dont have an error then we know that the cart.json does exist.
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find exisiting product.
      const exisitingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id,
      );
      const exisitingProduct = cart.products[exisitingProductIndex];
      let updatedProduct;
      if (exisitingProduct) {
        // Using the next gen JS object spread operator.
        // We can assign the updatedProuct object with the exisitingProduct properties
        updatedProduct = { ...exisitingProduct };
        updatedProduct.quantity++;

        // Copying the old array and reassinging it
        cart.products = [...cart.products];
        // Then we get the currently selected or exisitng product index;
        // And update its values with the updated product

        cart.products[exisitingProductIndex] = updatedProduct;
      } else {
        // Otherwise if we have a new product then we set it to.
        // Add new product & increase quantity
        updatedProduct = { id: id, quantity: 1 };
        // We set the cart.products array to the same data using the spread operator.
        // Essentially copying the old array and putting it back into it but with the added updatedProduct
        cart.products = [...cart.products, updatedProduct];
      }
      // Adding the + before the productPrice acutally converts it to a number. Which i never knew haha
      cart.totalPrice += +productPrice;

      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return; // Can't find cart so we return
      }
      // Spread operator to assign all of the file contents into updatedCart
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find((prod) => prod.id === id);

      if (!product) {
        return; // As we dont't have a prroduct that is in the cart
      }

      // Don't need this, only for readability
      const productQty = product.quantity;
      // Removing the products from the cart * by how many that are in the cart
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id,
      );
      updatedCart.totalPrice -= productPrice * productQty;

      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
