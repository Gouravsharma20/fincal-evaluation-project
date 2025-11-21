require("dotenv").config();

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 4000

const app = express();

//db connection
require("./db/connection")

//require routes

const userRoutes = require("./routes/UserRouter")




//Middlewares
app.use(express.json())
app.use(cors());

// User Routes
app.use("/api/users",userRoutes)

app.listen(PORT,()=>
    console.log(`app is running on port ${PORT}`)
);
