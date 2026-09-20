const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        default: null
    }
});

const CartSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
            unique: true
        },
        items: [CartItemSchema]
    },
    {
        timestamps: true
    }
);
const CartModel = mongoose.model("Cart", CartSchema);
module.exports = CartModel;