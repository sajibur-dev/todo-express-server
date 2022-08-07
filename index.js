const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
config();
const port = process.env.PORT || 5000;

// request parser

app.use(express.json());
app.use(cors());

// db connect :

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.aakf7.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const todoCollection = client.db("tasksManager").collection("todos");

    // post a todo :

    app.post("/todo", async (req, res) => {
      try {
        const body = req.body;
        const result = await todoCollection.insertOne(body);
        res.status(200).send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // get all todo :

    app.get("/todo", async (req, res) => {
      try {
        const result = await todoCollection.find().toArray();
        res.status(200).send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // update a todo

    app.put("/todo/:id", async (req, res) => {
      try {
        const filter = { _id: ObjectId(req.params.id) };
        const option = { upsert: true };
        const updatedDoc = {
          $set: {
            completed: req.body.completed,
          },
        };
        const result = await todoCollection.updateOne(
          filter,
          updatedDoc,
          option
        );
        res.status(200).send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // delete a todo :

    app.delete("/todo/:id", async (req, res) => {
      try {
        const query = { _id: ObjectId(req.params.id) };
        const result = await todoCollection.deleteOne(query);
        res.status(200).send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

run();

app.get("/", (req, res) => {
  res.send("app is running");
});

app.listen(port, () => console.log("server is running", port));
