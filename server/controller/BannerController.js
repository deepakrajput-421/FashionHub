const BannerModel = require("../model/BannerModel");

const AddBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const banner = new BannerModel({
            image: req.file.filename,
            title: req.body.title,
            heading: req.body.heading,
            description: req.body.description,
            buttonText: req.body.buttonText
        });

        await banner.save();
        res.status(200).json({
            message: "Banner added successfully",
            data: banner
        });
    } catch (error) {
        console.log("ADD BANNER ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const GetBanner = async (req, res) => {
    try {
        const result = await BannerModel.find();

        res.status(200).json({
            BannerData: result
        });
    } catch (error) {
        console.log("GET BANNER ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const DeleteBanner = async (req, res) => {
    try {
        const result = await BannerModel.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                message: "Banner not found"
            });
        }

        res.status(200).json({
            message: "Banner deleted successfully"
        });
    } catch (error) {
        console.log("DELETE BANNER ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    AddBanner,
    GetBanner,
    DeleteBanner
};