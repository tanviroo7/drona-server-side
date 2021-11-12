const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c3yth.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("dronaDB");

    const dronesCollection = database.collection("drones");

    const purchasedDronesCollection = database.collection("purchasedDrones");

    const reviewsCollection = database.collection("reviews");

    const usersCollection = database.collection("users");

    console.log("connected");

    // Get all drones data from database
    app.get("/allDrones", async (req, res) => {
      const cursor = dronesCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // Manage  product ,  Delete Specific Cars from Manage product
    app.delete("/allDrones/:dronesId", async (req, res) => {
      console.log("hitted");
      const query = {
        _id: ObjectId(req.params.dronesId),
      };
      console.log(req.params.dronesId);
      const result = await dronesCollection.deleteOne(query);

      res.json(result);
    });

    // Inserting Purchased Car in the database
    app.post("/purchasedDrones", async (req, res) => {
      const purchasedDronesData = req.body;

      const userResult = await purchasedDronesCollection.insertOne(
        purchasedDronesData
      );
      res.json(userResult);
    });

    // Getting all the purchased car of the specific user from the database via email in My Orders
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: `${email}` };
      const result = await purchasedDronesCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    });
    // Delete specific car from MyOrders
    app.delete("/deleteDrone/:droneId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.droneId),
      };

      const result = await purchasedDronesCollection.deleteOne(query);

      res.json(result);
      console.log(result);
    });
    //Post a review into the database
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);

      res.json(result);
    });

    //Get all the reviews from the database

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    //getting all the admins from the database

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Post a user to the database from email and password sign in

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //post a user to the database from the google login by google auth provider

    app.put("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });

    //making a user admin

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // Manage All Orders Get Api

    app.get("/manageAllOrders", async (req, res) => {
      const cursor = purchasedDronesCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // Manage All Orders , Delete specific purchased

    app.delete("/deletePurchasedDrones/:droneId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.droneId),
      };

      const result = await purchasedDronesCollection.deleteOne(query);

      res.json(result);
    });

    // Update status Pending to Shipped
    app.put("/updateStatus/:statusId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.statusId),
      };
      const filter = query;
      // const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `Shipped`,
        },
      };
      const result = await purchasedDronesCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // Add  product / more drones to  the Explore page

    app.post("/addProduct", async (req, res) => {
      const addDrones = req.body;
      const carsResult = await dronesCollection.insertOne(addDrones);

      res.json(carsResult);
    });

    // Manage Product where get all the data
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello Drona!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
