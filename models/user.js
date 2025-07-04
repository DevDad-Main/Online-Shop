const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class User {
  constructor(username, email, _id) {
    this.name = username;
    this.email = email;
    this._id = new mongodb.ObjectId(`${_id}`);
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  // save() {
  //   const db = getDb();
  //   let dbOperation;
  //
  //   if (this._id) {
  //     dbOperation = db.collection("users").updateOne(
  //       {
  //         _id: this._id,
  //       },
  //       {
  //         $set: this,
  //       },
  //     );
  //   } else {
  //     dbOperation = db.collection("users").insertOne(this);
  //   }
  //
  //   return dbOperation.then((result) =>
  //     console.log(result).catch((err) => console.log(err)),
  //   );
  // }
  //
  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .find({
        _id: new mongodb.ObjectId(`${userId}`),
      })
      .next();
    // .then((user) => {
    //   console.log(user);
    //   return user;
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }
}

module.exports = User;
