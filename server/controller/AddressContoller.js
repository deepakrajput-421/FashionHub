const AddressModel = require("../model/AddressModel");

const GetAddress = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const address = await AddressModel.findOne({ userEmail });

        res.json({
            success: true,
            address: address || null
        });
    } catch (error) {
        console.log("Get Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get address"
        });
    }
};

const SaveAddress = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const {
            name,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body;

        if (!name || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "All address fields are required"
            });
        }

        const savedAddress = await AddressModel.findOneAndUpdate(
            { userEmail },
            {
                userEmail,
                name,
                phone,
                address,
                city,
                state,
                pincode
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: "Address saved successfully",
            address: savedAddress
        });
    } catch (error) {
        console.log("Save Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save address"
        });
    }
};

const DeleteAddress = async (req, res) => {
    try {
        const userEmail = req.user.email;

        await AddressModel.findOneAndDelete({ userEmail });

        res.json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.log("Delete Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    }
};

module.exports = {
    GetAddress,
    SaveAddress,
    DeleteAddress
};