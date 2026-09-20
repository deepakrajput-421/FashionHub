
const WishlistModel = require("../model/WishlistModel");

const GetWishlist = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const wishlist = await WishlistModel.findOne({ userEmail })
            .populate("items.productId");

        if (!wishlist) {
            return res.json({
                success: true,
                items: []
            });
        }

        res.json({
            success: true,
            items: wishlist.items
        });
    } catch (error) {
        console.log("GET WISHLIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to get wishlist"
        });
    }
};

const ToggleWishlist = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        let wishlist = await WishlistModel.findOne({ userEmail });

        if (!wishlist) {
            wishlist = new WishlistModel({
                userEmail,
                items: [{ productId }]
            });

            await wishlist.save();

            return res.json({
                success: true,
                wishlisted: true,
                message: "Added to wishlist"
            });
        }

        const existingItem = wishlist.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            wishlist.items = wishlist.items.filter(
                item => item.productId.toString() !== productId
            );

            await wishlist.save();

            return res.json({
                success: true,
                wishlisted: false,
                message: "Removed from wishlist"
            });
        }

        wishlist.items.push({ productId });

        await wishlist.save();

        res.json({
            success: true,
            wishlisted: true,
            message: "Added to wishlist"
        });
    } catch (error) {
        console.log("TOGGLE WISHLIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update wishlist"
        });
    }
};

const RemoveFromWishlist = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId } = req.params;

        const wishlist = await WishlistModel.findOne({ userEmail });

        if (!wishlist) {
            return res.json({
                success: true,
                message: "Wishlist is empty"
            });
        }

        wishlist.items = wishlist.items.filter(
            item => item.productId.toString() !== productId
        );

        await wishlist.save();

        res.json({
            success: true,
            message: "Removed from wishlist"
        });
    } catch (error) {
        console.log("REMOVE WISHLIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to remove from wishlist"
        });
    }
};

module.exports = {
    GetWishlist,
    ToggleWishlist,
    RemoveFromWishlist
};

