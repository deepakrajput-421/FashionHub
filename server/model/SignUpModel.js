const Mongoose = require('../connection/connection')

const SignUpSchema = Mongoose.Schema({
    "name" :{
        type : String ,
        required : true
    },
   "email":{
        type : String ,
        required : true
    },
     "password":{
        type : String ,
        required : true
    },
    "confirm_password":{
        type : String ,
        required : true
    }
})
 const SignUpModel = Mongoose.model("Signup" , SignUpSchema);
 
 module.exports = SignUpModel ;