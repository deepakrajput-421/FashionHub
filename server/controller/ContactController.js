const ContactModel = require("../model/ContactModel");

const AddContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const data = new ContactModel({
            name,
            email,
            subject,
            message
        });

        await data.save();

        res.status(201).json({
            success: true,
            message: "Contact message sent successfully"
        });

    } catch (error) {
        console.log("Contact Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const GetContact = async (req, res) => {
    try {
        const data = await ContactModel
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json(data);

    } catch (error) {
        console.log("Get Contact Error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const DeleteContact = async (req, res) => {
    try {
        await ContactModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });

    } catch (error) {
        console.log("Delete Contact Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    AddContact,
    GetContact,
    DeleteContact
};