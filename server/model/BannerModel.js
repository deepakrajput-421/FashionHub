const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        required: true
    }
});

const BannerModel = mongoose.model("Banner", BannerSchema);

module.exports = BannerModel;