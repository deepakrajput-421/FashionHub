const Mongoose = require('../connection/connection');

const AddSchema = Mongoose.Schema({

    ClothName: {
        type: String,
        required: true
    },

    detail: {
        type: String,
        required: true
    },

    price: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    sizes: [
        {
            size: {
                type: String,
                required: true
            },

            stock: {
                type: String,
                required: true
            }
        }
    ],

    image: {
        type: String,
        required: true
    },


});

const AddModel = Mongoose.model('AddData', AddSchema);

module.exports = AddModel;