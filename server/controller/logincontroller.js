const LoginModel = require('../model/loginModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const logincontroller = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();

        const data = await LoginModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" }
        });

        if (!data) {
            return res.status(401).json({
                success: false,
                message: "Invalid email"
            });
        }

        const passwordMatch = await bcrypt.compare(
            req.body.pwd,
            data.Password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                adminId: data._id,
                email: data.email,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: "Admin login successful"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const SendAdminOTP = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const admin = await LoginModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" }
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin email not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        admin.resetOTP = String(otp);
        admin.resetOTPExpiry = Date.now() + 3 * 60 * 1000;

        await admin.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: "FashionHub Admin Password Reset OTP",
            text: `Your FashionHub Admin password reset OTP is ${otp}. This OTP is valid for 3 minutes.`
        });

        return res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log("ADMIN SEND OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "OTP sending failed"
        });
    }
};


const ResetAdminPassword = async (req, res) => {
    try {
        const {
            email: enteredEmail,
            otp,
            password,
            confirmPassword
        } = req.body;

        if (!enteredEmail || !otp || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const email = enteredEmail.trim().toLowerCase();

        const admin = await LoginModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" }
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        if (!admin.resetOTP || !admin.resetOTPExpiry) {
            return res.status(400).json({
                success: false,
                message: "Please get OTP first"
            });
        }

        if (Date.now() > admin.resetOTPExpiry) {
            admin.resetOTP = null;
            admin.resetOTPExpiry = null;

            await admin.save();

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (String(otp) !== String(admin.resetOTP)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        admin.Password = hashedPassword;
        admin.resetOTP = null;
        admin.resetOTPExpiry = null;

        await admin.save();

        return res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.log("ADMIN RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Password reset failed"
        });
    }
};


logincontroller.SendAdminOTP = SendAdminOTP;
logincontroller.ResetAdminPassword = ResetAdminPassword;

module.exports = logincontroller;