const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, _id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    // Ternarary here as if we dont always define the id at the end
    // This will always create a new mongo ID which we don't want.
    // so we add a check if we dont have an id we return null otherwise make one.
    // Then we won't have any more issues in our save method now
    this._id = _id ? new mongodb.ObjectId(`${_id}`) : null;
  }

  save() {
    const db = getDb();
    let dbOperation;
    if (this._id) {
      //Update product if the id is set.
      dbOperation = db
        .collection("products")
        // Applying a filter to check if _id == this._id above
        .updateOne(
          { _id: this._id },
          {
            // This works as the Product is just an object and the key:value pairs are the same as.
            // MongoDb expects
            $set: this,
          },
        );
    } else {
      // Otherwise it's not so we create a new product
      dbOperation = db.collection("products").insertOne(this);
    }
    // Telling Mongo db which collection we want to work with
    // If it dosen't exist, just like our Database if it dosen't exist MongoDb will create it on the fly for us
    return dbOperation
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    // Using toArray here, which is bet suited to a max of 100 or so results.
    // Later we will convert this to pagination which is best suited when working with large datasets
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return (
      db
        .collection("products")
        // We need to use mongodbs ObjectId conversion as javascript cant translate the bson format it is stored in, so now we can compare the ids
        .find({ _id: new mongodb.ObjectId(`${prodId}`) })
        .next()
        .then((product) => {
          console.log(product);
          return product;
        })
        .catch((err) => {
          console.log(err);
        })
    );
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({
        _id: new mongodb.ObjectId(`${prodId}`),
      })
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }
}

module.exports = Product;

// const getProductsFromFile = (cb) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };
//
// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }
//
//   save() {
//     getProductsFromFile((products) => {
//       // checking to see if we already have an ID and if we do we will update that product, else we create a new id with the new product
//       if (this.id) {
//         const exisitingProductIndex = products.findIndex(
//           (prod) => prod.id === this.id,
//         );
//         const updatedProducts = [...products];
//         updatedProducts[exisitingProductIndex] = this;
//         fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//           console.log(err);
//         });
//       } else {
//         // Adds a new property to the whole object Product we are working in
//         this.id = Math.random().toString();
//         products.push(this);
//         fs.writeFile(p, JSON.stringify(products), (err) => {
//           console.log(err);
//         });
//       }
//     });
//   }
//
//   static deleteByID(id) {
//     getProductsFromFile((products) => {
//       // Storing the product we want to delet, so we can use it later
//       const product = products.find((prod) => prod.id === id);
//       // Filter will return all of the products that match our criteria and put them into a new array.
//       // Here we want it to return all the products that don't equal to the id we are currently on, essentialyl removing it from our array
//       const updatedProducts = products.filter((p) => p.id !== id);
//       fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//         if (!err) {
//           // Remove from the cart as the product dosent exist
//           Cart.deleteProduct(id, product.price);
//         }
//       });
//     });
//   }
//
//   /**
//    * Utility function to fetch all products in the products array
//    * @param {callback} cb
//    * @returns All the items in the product array
//    */
//   static fetchAll(cb) {
//     getProductsFromFile(cb);
//   }
//
//   static findByID(id, cb) {
//     getProductsFromFile((products) => {
//       // Trying to find in all of our products if the current product we are on
//       // ID matches the one we pass into the function of essentially trying to
//       // look at the details of on the website
//       const product = products.find((p) => p.id === id);
//       cb(product);
//     });
//   }
// };
