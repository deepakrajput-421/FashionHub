const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "flat"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    userType: {
        type: String,
        enum: ["all", "new", "old"],
        default: "all"
    },
    isActive: {
        type: Boolean,
        default: true
    }
});
const CouponModel = mongoose.model("Coupon", CouponSchema);

module.exports = CouponModel;