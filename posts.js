const express = require('express');
const {MongoClient}=require("mongodb");

const app = express();
const port = 3000;

const uri="mongodb://127.0.0.1:27017";
const dbName="linkedin";

app.use(express.json());

let db,posts;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        posts = db.collection("posts");

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
app.get('/posts', async (req, res) => {
    try {
        const allUsers = await posts.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});


// GET: Fetch a specific post by postId
app.get('/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await posts.findOne({ postId });

        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).send("Post not found");
        }
    } catch (err) {
        res.status(500).send("Error fetching post: " + err.message);
    }
});



// POST: Add a new user
app.post('/posts', async (req, res) => {
    try {
        // console.log("Request Object: ",req)
        // console.log("Request Body: ", req.body)
        const newPost = req.body;
        const result = await posts.insertOne(newPost);
        res.status(201).send(`New post added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding post : " + err.message);
    }
});


// PATCH: Partially update a user headline
app.patch('/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId; 
        const updates = req.body; 

        
        const result = await posts.updateOne({ postId }, { $set: updates });

        if (result.modifiedCount > 0) {
            res.status(200).send(`${result.modifiedCount} post(s) updated`);
        } else {
            res.status(404).send("Post not found or no changes made");
        }
    } catch (err) {
        res.status(500).send("Error updating post: " + err.message);
    }
});



// DELETE: Remove a user
app.delete('/posts/:postId', async (req, res) => {
    try {
        // console.log(req.params)
        // console.log(req.params.name)
        const postId = req.params.postId;
        console.log(postId)
        const result = await posts.deleteOne({ postId });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});