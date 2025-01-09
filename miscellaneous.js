const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const uri = "mongodb://127.0.0.1:27017";
const dbName = "linkedin";

app.use(express.json());

let db, users;

// Initialize Database connection
async function initializeDatabase() {
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        // Access the "LinkedIn" database
        db = client.db(dbName);

        // Set the correct collection name for users
        users = db.collection("users");

        // Start the server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Call the function to initialize the database connection
initializeDatabase();

// API Endpoints

// GET /users/:userId/profile-views: Fetch profile views count for a user
app.get('/users/:userId/profile-views', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ profileViews: user.profileViews });
    } catch (err) {
        console.error("Error fetching profile views:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT /users/:userId/skills: Add a skill to a user
app.put('/users/:userId/skills', async (req, res) => {
    try {
        const { userId } = req.params;
        const { skill } = req.body;

        if (!skill) {
            return res.status(400).json({ message: "Skill is required" });
        }

        const result = await users.updateOne(
            { userId },
            { $push: { skills: skill } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: `Skill "${skill}" added to user` });
    } catch (err) {
        console.error("Error adding skill:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// PATCH /users/:userId/premium: Upgrade to premium account
app.patch('/users/:userId/premium', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await users.updateOne(
            { userId },
            { $set: { isPremium: true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "User not found or already premium" });
        }

        res.status(200).json({ message: "User upgraded to premium account" });
    } catch (err) {
        console.error("Error upgrading to premium:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
