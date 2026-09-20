const CategoryModel = require('../model/CategoryModel');
const AddData = require('../model/AddModel');

const CategoryController = async (req, res, next) => {
    try {
        const Gender = req.body.Gender?.trim();
        const CategoryName = req.body.CategoryName?.trim();

        if (!Gender || !CategoryName) {
            return res.status(400).json({
                message: "Gender and Category Name are required"
            });
        }

        const existingCategory = await CategoryModel.findOne({
            Gender: { $regex: `^${Gender}$`, $options: "i" },
            CategoryName: { $regex: `^${CategoryName}$`, $options: "i" }
        });

        if (existingCategory) {
            return res.status(400).json({
                message: `${Gender} ${CategoryName} category already exists`
            });
        }

        let CategoryData = CategoryModel({
            Gender: Gender,
            CategoryName: CategoryName,
        });

        let result = await CategoryData.save();

        res.json({
            message: "Category Added Successfully",
            data: result
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Category Add Failed",
            error: error.message
        });
    }
};

const GetCategory = async(req, res, next) => {
    try {
        let review = await CategoryModel.find({});
        res.json({ CData: review });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Category Fetch Failed",
            error: error.message
        });
    }
};

const DeleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await CategoryModel.findByIdAndDelete(id);

        res.json({ data: result });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Category Delete Failed",
            error: error.message
        });
    }
};

const GetCatData = async (req, res) => {
    try {
        const category = req.params.category;
        const gender = req.params.gender;

        const allData = await AddData.find({
            gender: gender,
            category: category
        });

        res.json({
            success: true,
            CategoryData: allData
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Category Data Fetch Failed"
        });
    }
};

module.exports = {
    CategoryController,
    GetCategory,
    DeleteCategory,
    GetCatData
};

