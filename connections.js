const express = require('express');
const {MongoClient}=require("mongodb");

const app = express();
const port = 3000;

const uri="mongodb://127.0.0.1:27017";
const dbName="linkedin";

app.use(express.json());

let db,connections;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        connections = db.collection("connections");

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

// connections 
// GET: Fetch connections for a specific user
app.get('/connections/:userId', async (req, res) => {
    try {
        const userConnections = await connections.find({ user1: req.params.userId }).toArray();
        if (userConnections.length > 0) {
            res.status(200).json(userConnections);
        } else {
            res.status(404).send("No connections found for this user");
        }
    } catch (err) {
        res.status(500).send("Error fetching connections: " + err.message);
    }
});



// POST: Add a new user
app.post('/connections', async (req, res) => {
    try {
        // console.log("Request Object: ",req)
        // console.log("Request Body: ", req.body)
        const newConnection = req.body;
        const result = await connections.insertOne(newConnection);
        res.status(201).send(`Connection request sent with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error sending connection request: " + err.message);
    }
});


// PATCH: Partially update a user headline
app.patch('/connections/:connectionId', async (req, res) => {
    try {
        const connectionId = (req.params.connectionId);
        const updates = req.body;
        const result = await connections.updateOne({ connectionId }, { $set: { status: "connected" }});
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error accepting connection: " + err.message);
    }
});


// DELETE: Remove a user
app.delete('/connections/:connectionId', async (req, res) => {
    try {
        // console.log(req.params)
        // console.log(req.params.name)
        const connectionId = req.params.connectionId;
        console.log(connectionId)
        const result = await connections.deleteOne({ connectionId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});