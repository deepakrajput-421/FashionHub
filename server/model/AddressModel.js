const Mongoose = require('../connection/connection');

const AddressSchema = Mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const AddressModel = Mongoose.model('Address', AddressSchema);

module.exports = AddressModel;