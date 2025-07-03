const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

// Private Variable -> Only used in this file
let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://devdad:Martametz311219!@cluster1.6zhu8cq.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster1",
  )
    .then((client) => {
      console.log("Connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

/**
 * Gets our MongoDb Database. MongoDb handles this elegantly with connection pooling,
 * where it will make it provides sufficient connections for simultaneous interactions with our DB.
 * @returns MongoDb Databse
 */
const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No Database Found!.";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
