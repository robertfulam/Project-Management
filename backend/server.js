const express = require("express");
const { default: mongoose } = require("mongoose");
const taskRoutes = require("./routes/taskRoutes");
require('dotenv').config();
cors = require('cors');
const PORT = process.env.PORT || 5000;


// Create an instance of the Express application

const app = express();


// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use("/api/tasks", taskRoutes);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// Define a simple route for testing
app.get("/", (req, res) => {
  res.json({ message: 'Hello from the server!' });
});



// Start the server and listen on port 5000
mongoose.connect(process.env.MONGODB_URI, { })
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});        