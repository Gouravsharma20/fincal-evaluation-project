const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/finalEvaluationProject").then(()=>{
    console.log("connection established successfully")
})
.catch((err)=>{console.log(`Error is ${err}`)})