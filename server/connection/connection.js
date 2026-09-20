require('dotenv').config();
const Mongoose = require('mongoose');

Mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Successfully connected to Database");
}).catch((err)=>{
   console.log(err);
})

module.exports = Mongoose   