const fs = require("fs");
const path = require("path");
const Cart = require("./cart");
const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "products.json",
);

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      // checking to see if we already have an ID and if we do we will update that product, else we create a new id with the new product
      if (this.id) {
        const exisitingProductIndex = products.findIndex(
          (prod) => prod.id === this.id,
        );
        const updatedProducts = [...products];
        updatedProducts[exisitingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      } else {
        // Adds a new property to the whole object Product we are working in
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static deleteByID(id) {
    getProductsFromFile((products) => {
      // Storing the product we want to delet, so we can use it later
      const product = products.find((prod) => prod.id === id);
      // Filter will return all of the products that match our criteria and put them into a new array.
      // Here we want it to return all the products that don't equal to the id we are currently on, essentialyl removing it from our array
      const updatedProducts = products.filter((p) => p.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          // Remove from the cart as the product dosent exist
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  /**
   * Utility function to fetch all products in the products array
   * @param {callback} cb
   * @returns All the items in the product array
   */
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findByID(id, cb) {
    getProductsFromFile((products) => {
      // Trying to find in all of our products if the current product we are on
      // ID matches the one we pass into the function of essentially trying to
      // look at the details of on the website
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
};
