const OrderModel = require("../model/OrderModel");
const CartModel = require("../model/CartModel");
const AddData = require("../model/AddModel");
const CouponModel = require("../model/CouponModel");

const CreateOrder = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const {
            shippingAddress,
            couponCode
        } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        const {
            name,
            phone,
            address,
            city,
            state,
            pincode
        } = shippingAddress;

        if (
            !name ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide complete shipping address"
            });
        }

        if (!/^[6-9]\d{9}$/.test(String(phone))) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number"
            });
        }

        if (!/^\d{6}$/.test(String(pincode))) {
            return res.status(400).json({
                success: false,
                message: "Invalid pincode"
            });
        }

        const cart = await CartModel.findOne({
            userEmail
        });

        if (
            !cart ||
            !cart.items ||
            cart.items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        let subtotal = 0;
        const orderItems = [];

        for (const cartItem of cart.items) {
            const product = await AddData.findById(
                cartItem.productId
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const quantity = Number(
                cartItem.quantity
            );

            if (!quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product quantity"
                });
            }

            let selectedSize = null;
            let availableStock = 0;

            if (cartItem.size) {
                selectedSize = product.sizes?.find(
                    sizeData =>
                        String(sizeData.size).toUpperCase() ===
                        String(cartItem.size).toUpperCase()
                );

                if (!selectedSize) {
                    return res.status(400).json({
                        success: false,
                        message: `Size ${cartItem.size} is not available for ${product.ClothName}`
                    });
                }

                availableStock = Number(
                    selectedSize.stock || 0
                );
            } else {
                availableStock = Number(
                    product.stock || 0
                );
            }

            if (availableStock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.ClothName} is out of stock`
                });
            }

            const price = Number(
                cartItem.price ||
                product.price ||
                0
            );

            if (price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for ${product.ClothName}`
                });
            }

            subtotal += price * quantity;

            orderItems.push({
                productId: product._id,
                productName: product.ClothName,
                image: product.image,
                size: cartItem.size || null,
                quantity,
                price
            });
        }

        let discount = 0;

        if (couponCode) {
            const coupon = await CouponModel.findOne({
                code: String(couponCode).trim().toUpperCase()
            });

            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coupon code"
                });
            }

            if (
                coupon.expiryDate &&
                new Date(coupon.expiryDate) < new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon has expired"
                });
            }

            if (
                coupon.minOrderAmount &&
                subtotal < Number(coupon.minOrderAmount)
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order amount is ₹${Number(
                        coupon.minOrderAmount
                    ).toLocaleString("en-IN")}`
                });
            }

            if (
                coupon.discountType === "percentage"
            ) {
                discount =
                    subtotal *
                    Number(coupon.discountValue || 0) /
                    100;

                if (coupon.maxDiscount) {
                    discount = Math.min(
                        discount,
                        Number(coupon.maxDiscount)
                    );
                }
            } else {
                discount = Number(
                    coupon.discountValue || 0
                );
            }

            discount = Math.min(
                discount,
                subtotal
            );
        }

        const shippingCharge =
            subtotal >= 999 ? 0 : 50;

        const totalAmount = Math.max(
            0,
            subtotal +
            shippingCharge -
            discount
        );

        const expectedDeliveryDate = new Date();

        expectedDeliveryDate.setDate(
            expectedDeliveryDate.getDate() + 5
        );

        for (const cartItem of cart.items) {
            const product = await AddData.findById(
                cartItem.productId
            );

            if (!product) {
                continue;
            }

            const quantity = Number(
                cartItem.quantity
            );

            if (
                cartItem.size &&
                product.sizes?.length
            ) {
                const sizeIndex =
                    product.sizes.findIndex(
                        sizeData =>
                            String(sizeData.size).toUpperCase() ===
                            String(cartItem.size).toUpperCase()
                    );

                if (sizeIndex !== -1) {
                    const currentStock = Number(
                        product.sizes[sizeIndex].stock || 0
                    );

                    if (currentStock < quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `${product.ClothName} is out of stock`
                        });
                    }

                    product.sizes[sizeIndex].stock =
                        currentStock - quantity;

                    product.markModified("sizes");

                    await product.save();
                }
            } else {
                const currentStock = Number(
                    product.stock || 0
                );

                if (currentStock < quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.ClothName} is out of stock`
                    });
                }

                product.stock =
                    currentStock - quantity;

                await product.save();
            }
        }

        const order = new OrderModel({
            userEmail,

            items: orderItems,

            shippingAddress: {
                name,
                phone,
                address,
                city,
                state,
                pincode
            },

            subtotal,

            discount,

            shippingCharge,

            totalAmount,

            expectedDeliveryDate,

            paymentMethod: "COD",

            paymentStatus: "pending",

            orderStatus: "confirmed"
        });

        const savedOrder = await order.save();

        cart.items = [];

        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: savedOrder
        });

    } catch (error) {
        console.error(
            "CreateOrder Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
    }
};

const GetOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const orders = await OrderModel.find({
            userEmail
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error(
            "GetOrders Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

const CancelOrder = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { orderId } = req.params;

        const order = await OrderModel.findOne({
            _id: orderId,
            userEmail
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (
            order.orderStatus === "delivered" ||
            order.orderStatus === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "This order cannot be cancelled"
            });
        }

        for (const item of order.items) {
            const product = await AddData.findById(
                item.productId
            );

            if (!product) {
                continue;
            }

            const quantity = Number(
                item.quantity || 0
            );

            if (
                item.size &&
                product.sizes?.length
            ) {
                const sizeIndex =
                    product.sizes.findIndex(
                        sizeData =>
                            String(sizeData.size).toUpperCase() ===
                            String(item.size).toUpperCase()
                    );

                if (sizeIndex !== -1) {
                    product.sizes[sizeIndex].stock =
                        Number(
                            product.sizes[sizeIndex].stock || 0
                        ) + quantity;

                    product.markModified("sizes");

                    await product.save();
                }
            } else {
                product.stock =
                    Number(
                        product.stock || 0
                    ) + quantity;

                await product.save();
            }
        }

        order.orderStatus = "cancelled";

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error(
            "CancelOrder Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

module.exports = {
    CreateOrder,
    GetOrders,
    CancelOrder
};