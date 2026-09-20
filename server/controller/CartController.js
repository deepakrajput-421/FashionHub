    const CartModel = require("../model/CartModel");
    const AddData = require("../model/AddModel");

    const GetCart = async (req, res) => {
        try {
            const userEmail = req.user.email;

            const cart = await CartModel.findOne({ userEmail });

            if (!cart) {
                return res.json({
                    success: true,
                    items: []
                });
            }

            const items = await Promise.all(
                cart.items.map(async (item) => {
                    const product = await AddData.findById(item.productId);

                    if (!product) {
                        return null;
                    }

                    return {
                        _id: item._id,
                        productId: product,
                        quantity: item.quantity,
                        size: item.size
                    };
                })
            );

            res.json({
                success: true,
                items: items.filter(item => item !== null)
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to get cart"
            });
        }
    };


    const AddToCart = async (req, res) => {
        try {
            const userEmail = req.user.email;

            const { productId, quantity, size } = req.body;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            const product = await AddData.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (size) {
                const selectedSize = product.sizes?.find(
                    item => item.size === size
                );

                if (!selectedSize) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid size"
                    });
                }

                const stock = Number(selectedSize.stock || 0);

                if (stock <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Selected size is out of stock"
                    });
                }

                if (Number(quantity || 1) > stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${stock} item available in size ${size}`
                    });
                }
            }

            let cart = await CartModel.findOne({ userEmail });

            if (!cart) {
                cart = new CartModel({
                    userEmail,
                    items: []
                });
            }

            const existingItem = cart.items.find(
                item =>
                    item.productId.toString() === productId &&
                    item.size === (size || null)
            );

            if (existingItem) {

                const newQuantity =
                    existingItem.quantity + Number(quantity || 1);

                if (size) {
                    const selectedSize = product.sizes?.find(
                        item => item.size === size
                    );

                    const stock = Number(selectedSize?.stock || 0);

                    if (newQuantity > stock) {
                        return res.status(400).json({
                            success: false,
                            message: `Only ${stock} item available in size ${size}`
                        });
                    }
                }

                existingItem.quantity = newQuantity;

            } else {

                cart.items.push({
                    productId,
                    quantity: Number(quantity || 1),
                    size: size || null
                });
            }

            await cart.save();

            res.json({
                success: true,
                message: "Product added to cart"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to add product to cart"
            });
        }
    };


    const UpdateCart = async (req, res) => {
        try {
            const userEmail = req.user.email;

            const { itemId, quantity, size } = req.body;

            const cart = await CartModel.findOne({ userEmail });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: "Cart not found"
                });
            }

            const item = cart.items.id(itemId);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Cart item not found"
                });
            }

            const product = await AddData.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (quantity !== undefined) {

                const newQuantity = Number(quantity);

                if (newQuantity < 1) {
                    cart.items.pull(itemId);
                } else {

                    const currentSize = size !== undefined
                        ? size
                        : item.size;

                    if (currentSize) {

                        const selectedSize = product.sizes?.find(
                            sizeData => sizeData.size === currentSize
                        );

                        const stock = Number(
                            selectedSize?.stock || 0
                        );

                        if (newQuantity > stock) {
                            return res.status(400).json({
                                success: false,
                                message: `Only ${stock} item available in size ${currentSize}`
                            });
                        }
                    }

                    item.quantity = newQuantity;
                }
            }

            if (size !== undefined) {

                const selectedSize = product.sizes?.find(
                    sizeData => sizeData.size === size
                );

                const stock = Number(
                    selectedSize?.stock || 0
                );

                if (stock <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Selected size is out of stock"
                    });
                }

                if (item.quantity > stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${stock} item available in size ${size}`
                    });
                }

                item.size = size;
            }

            await cart.save();
            res.json({
                success: true,
                message: "Cart updated"
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to update cart"
            });
        }
    };


    const RemoveFromCart = async (req, res) => {
        try {
            const userEmail = req.user.email;
            const { itemId } = req.body;
            const cart = await CartModel.findOne({ userEmail });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: "Cart not found"
                });
            }

            cart.items.pull(itemId);

            await cart.save();

            res.json({
                success: true,
                message: "Product removed from cart"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to remove product"
            });
        }
    };


    const ClearCart = async (req, res) => {
        try {
            const userEmail = req.user.email;
            await CartModel.findOneAndUpdate(
                { userEmail },
                {
                    $set: {
                        items: []
                    }
                }
            );

            res.json({
                success: true,
                message: "Cart cleared"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to clear cart"
            });
        }
    };


    module.exports = {
        GetCart,
        AddToCart,
        UpdateCart,
        RemoveFromCart,
        ClearCart
    };