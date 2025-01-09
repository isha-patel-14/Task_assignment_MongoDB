const express = require('express');
const {MongoClient}=require("mongodb");

const app = express();
const port = 3000;

const uri="mongodb://127.0.0.1:27017";
const dbName="linkedin";

app.use(express.json());

let db,users;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Database
initializeDatabase();

//Routes

// User Managemet

// GET: List all users
app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});


// GET: Fetch a specific user
app.get('/users/:userId', async (req, res) => {
    try {
        const user = await users.findOne({ userId: req.params.userId });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(500).send("Error fetching user: " + err.message);
    }
});


// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        // console.log("Request Object: ",req)
        // console.log("Request Body: ", req.body)
        const newUser = req.body;
        const result = await users.insertOne(newUser);
        res.status(201).send(`User added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding user: " + err.message);
    }
});


// PATCH: Partially update a user headline
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = (req.params.userId);
        const updates = req.body;
        const result = await users.updateOne({ userId }, { $set: updates });
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error partially updating user: " + err.message);
    }
});


// DELETE: Remove a user
app.delete('/users/:userId', async (req, res) => {
    try {
        // console.log(req.params)
        // console.log(req.params.name)
        const userId = req.params.userId;
        console.log(userId)
        const result = await users.deleteOne({ userId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});