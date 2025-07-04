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
    // const cartProduct = this.cart.items.findIndex((cp) => {
    //   // If this reutrns a valid index anything other than -1 which is the default value,
    //   // Then we know this product already exists
    //   return cp._id === product._id;
    // });
    const updatedCart = {
      // Using the spread operator to copy the exisiting cart product properties,
      // Then anything else we adda after the , will override or add new properties
      items: [{ ...product, quantity: 1 }],
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
