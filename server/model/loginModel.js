const Mongoose = require('../connection/connection');

const loginSchema = Mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    Password: {
        type: String,
        required: true
    },

    resetOTP: {
        type: String,
        default: null
    },

    resetOTPExpiry: {
        type: Date,
        default: null
    }

});

const LoginModel = Mongoose.model('login', loginSchema);

module.exports = LoginModel;