const Mongoose = require('../connection/connection');

const CategorySchema = Mongoose.Schema({

    "Gender" : String,
    "CategoryName" : String,

})

const CategoryModel = Mongoose.model("AddCategory" , CategorySchema );

module.exports = CategoryModel;