const CouponModel = require("../model/CouponModel");
const CartModel = require("../model/CartModel");
const AddModel = require("../model/AddModel");

const AddCoupon = async (req, res) => {
    try {
        const AddCouponData = new CouponModel({
            code: req.body.code,
            discountType: req.body.discountType,
            discountValue: req.body.discountValue,
            minOrderAmount: req.body.minOrderAmount,
            maxDiscount: req.body.maxDiscount,
            expiryDate: req.body.expiryDate,
            usageLimit: req.body.usageLimit,
            userType: req.body.userType
        });

       

        if (
            !AddCouponData.code ||
            !AddCouponData.discountType ||
            !AddCouponData.discountValue ||
            !AddCouponData.expiryDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        const existingCoupon = await CouponModel.findOne({
            code: AddCouponData.code.toUpperCase()
        });

        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon already exists"
            });
        }

        const coupon = await CouponModel.create({
            code: AddCouponData.code.toUpperCase(),
            discountType: AddCouponData.discountType,
            discountValue: AddCouponData.discountValue,
            minOrderAmount: AddCouponData.minOrderAmount || 0,
            maxDiscount: AddCouponData.maxDiscount || null,
            expiryDate: AddCouponData.expiryDate,
            usageLimit: AddCouponData.usageLimit || null,
            userType: AddCouponData.userType || "all"
        });

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            coupon
        });
    } catch (error) {
       

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const GetCoupons = async (req, res) => {
    try {
        const coupons = await CouponModel.find().sort({ _id: -1 });

        res.status(200).json({
            success: true,
            couponData: coupons
        });
    } catch (error) {
       

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const DeleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await CouponModel.findByIdAndDelete(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Coupon deleted successfully"
        });
    } catch (error) {
       

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const ApplyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required"
            });
        }

        // JWT se logged-in user
        const userEmail = req.user?.email;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        // Coupon find
        const coupon = await CouponModel.findOne({
            code: code.trim().toUpperCase()
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid coupon code"
            });
        }

        // Active check
        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: "Coupon is inactive"
            });
        }

        // Expiry check
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({
                success: false,
                message: "Coupon has expired"
            });
        }

        // Usage limit check
        if (
            coupon.usageLimit !== null &&
            coupon.usedCount >= coupon.usageLimit
        ) {
            return res.status(400).json({
                success: false,
                message: "Coupon usage limit reached"
            });
        }

        // Logged-in user ka cart
        const cart = await CartModel.findOne({
            userEmail: userEmail
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Backend se actual cart amount calculate
        let cartAmount = 0;

        for (const item of cart.items) {
            const product = await AddModel.findById(item.productId);

            if (!product) {
                continue;
            }

            const price = Number(product.price || 0);
            const quantity = Number(item.quantity || 1);

            cartAmount += price * quantity;
        }

        if (cartAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to calculate cart amount"
            });
        }

        // Minimum order check
        if (
            cartAmount <
            Number(coupon.minOrderAmount || 0)
        ) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${coupon.minOrderAmount}`
            });
        }

        // Abhi sirf ALL users coupon
        if (coupon.userType !== "all") {
            return res.status(400).json({
                success: false,
                message: "This coupon is currently available only for all users"
            });
        }

        // Discount calculate
        let discount = 0;

        if (coupon.discountType === "percentage") {
            discount =
                (cartAmount * Number(coupon.discountValue)) / 100;

            // Maximum discount
            if (
                coupon.maxDiscount !== null &&
                discount > Number(coupon.maxDiscount)
            ) {
                discount = Number(coupon.maxDiscount);
            }
        } else if (coupon.discountType === "flat") {
            discount = Number(coupon.discountValue);
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid discount type"
            });
        }

        // Discount cart amount se zyada nahi ho sakta
        if (discount > cartAmount) {
            discount = cartAmount;
        }

        discount = Math.round(discount);

        const finalAmount = cartAmount - discount;

        res.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: coupon.code,
            cartAmount: cartAmount,
            discount: discount,
            finalAmount: finalAmount
        });

    } catch (error) {
        console.log("APPLY COUPON ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



module.exports = {
    AddCoupon,
    ApplyCoupon,
    GetCoupons,
    DeleteCoupon
};