const Mongoose = require('../connection/connection');

const OrderSchema = Mongoose.Schema({

    userEmail: {
        type: String,
        required: true
    },

    items: [
        {
            productId: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "AddData",
                required: true
            },

            productName: {
                type: String,
                required: true
            },

            image: {
                type: String,
                required: true
            },

            size: {
                type: String,
                default: null
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: String,
                required: true
            }
        }
    ],

    shippingAddress: {
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
    },

    subtotal: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0
    },

    shippingCharge: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "razorpay"],
        default: "COD"
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    orderStatus: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ],
        default: "pending"
    },
        expectedDeliveryDate: {
           type: Date,
           required: true
}

}, {
    timestamps: true
});

const OrderModel = Mongoose.model("Order", OrderSchema);

module.exports = OrderModel;