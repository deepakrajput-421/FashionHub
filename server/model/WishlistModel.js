
const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
            unique: true
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "AddData",
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);

