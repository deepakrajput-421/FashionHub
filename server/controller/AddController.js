const AddModel = require("../model/AddModel");

const Addcontroller = async (req, res) => {
      
    const Userd = new AddModel({
        ClothName: req.body.ClothName,
        detail: req.body.detail,
        price: req.body.price,
        gender: req.body.gender,
        category: req.body.category,
        sizes: JSON.parse(req.body.sizes),
        Weartype: req.body.Weartype,
        image: req.file?.filename
    });

    const result = await Userd.save();
    res.json({
        success: true,
        data: result
    });
};


const GetData = async (req, res) => {
    const ClothData = await AddModel.find({});
    res.json({
        "ClothData": ClothData
    });
};


// DELETE CONTROLLER

const DeleteData = async (req, res) => {

    try {

        const id = req.params.id;

        const result =
            await AddModel.findByIdAndDelete(id);

        res.json({
            data: result
        });

    } catch (error) {

        console.log(error);

    }
};


// UPDATE DATA

const UpdateData = async (req, res) => {

    const id = req.params.id;

    const data =
        await AddModel.findById(id);

    res.json({
        result: data
    });
};


// NEW DATA / UPDATE

const NewData = async (req, res) => {

    const id = req.params.id;

    const data =
        await AddModel.findByIdAndUpdate(
            id,
            {
                ClothName: req.body.ClothName,
                detail: req.body.detail,
                price: req.body.price,
                gender: req.body.gender,
                category: req.body.category,
                sizes: JSON.parse(req.body.sizes),
                image: req.file?.filename,  
            }
        );
    res.json({
        result: data
    });
};
module.exports = {Addcontroller,GetData,DeleteData,UpdateData,NewData};