const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      // If this reutrns a valid index anything other than -1 which is the default value,
      // Then we know this product already exists
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // We either updated quantity for an exisitng item.
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
      // Or we simply add a new one
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(`${product._id}`),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      // Using the spread operator to copy the exisiting cart product properties,
      // Then anything else we adda after the , will override or add new properties
      items: updatedCartItems,
    };
    const db = getDb();
    return db.collection("users").updateOne(
      {
        _id: new mongodb.ObjectId(`${this._id}`),
      },
      {
        $set: {
          // Overriding the old cart with the new one
          cart: updatedCart,
        },
      },
    );
  }

  getCart() {
    const db = getDb();

    // if (!this.cart || !Array.isArray(this.cart.items)) {
    //   return Promise.resolve([]);
    // }

    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    // Essentially filtering our cart items and returning all of them exepct the one twe want to delete. -> removing it from the array.
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });

    // Then we push that updated Cart back onto our user with the modified values
    const db = getDb();
    return db.collection("users").updateOne(
      {
        _id: new mongodb.ObjectId(`${this._id}`),
      },
      {
        $set: { cart: { items: updatedCartItems } },
      },
    );
  }

  addOrder() {
    // We dont't need to pass any parameters as we will be accessing the cart which resides as a param on the User
    // Putting it into a new colletion

    const db = getDb();
    return (
      db
        .collection("orders")
        .insertOne(this.cart)
        // Once we have removed the items from our cart by plcing them in the orders collection
        // We essentially make our cart an empty object again (Default)
        .then((result) => {
          // Clearing the cart in the user Object
          this.cart = { items: [] };

          // Then we also clear it from the current users database
          return db.collection("users").updateOne(
            {
              _id: new mongodb.ObjectId(`${this._id}`),
            },
            {
              $set: { cart: { items: [] } },
            },
          );
        })
    );
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({
        _id: new mongodb.ObjectId(`${userId}`),
      })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
