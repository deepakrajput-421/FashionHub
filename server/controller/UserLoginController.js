
const SignUpModel = require("../model/SignUpModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserLoginData = async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await SignUpModel.findOne({
        email: {
            $regex: `^${normalizedEmail}$`,
            $options: "i"
        }
    });

    if (!user) {
        return res.json({
            success: false,
            message: "Email not registered"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.json({
            success: false,
            message: "Wrong password"
        });
    }

    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        success: true,
        message: "Login successful",
        data: {
            name: user.name,
            email: user.email
        }
    });
};

module.exports = UserLoginData;

