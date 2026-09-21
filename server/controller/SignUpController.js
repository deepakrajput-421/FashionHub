const SignUpModel = require("../model/SignUpModel");
const bcrypt = require("bcrypt");
const { Resend } = require("resend");
const jwt = require("jsonwebtoken");

const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = {};

const SendOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await SignUpModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" }
        });

        if (user) {
            return res.json({
                success: false,
                message: "Email already registered"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        otpStore[email] = {
            otp: otp,
            expires: Date.now() + 3 * 60 * 1000
        };

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "FashionHub OTP Verification",
            text: `Your FashionHub OTP is ${otp}. This OTP is valid for 3 minutes.`
        });

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log("SEND OTP ERROR:", error);

        res.status(500).json({
            success: false,
            message: "OTP sending failed"
        });
    }
};


const VerifyOTP = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            confirm_password,
            otp
        } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();

        const storedOTP = otpStore[normalizedEmail];

        if (!storedOTP) {
            return res.json({
                success: false,
                message: "Please get OTP first"
            });
        }

        if (Date.now() > storedOTP.expires) {
            delete otpStore[normalizedEmail];

            return res.json({
                success: false,
                message: "OTP expired"
            });
        }

        if (Number(otp) !== storedOTP.otp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const Signup = new SignUpModel({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            confirm_password: hashedPassword
        });

        const result = await Signup.save();

        delete otpStore[normalizedEmail];

        const token = jwt.sign(
            {
                userId: result._id,
                email: normalizedEmail
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: "Signup successful",
            data: result
        });

    } catch (error) {
        console.log("VERIFY OTP ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Signup failed"
        });
    }
};


const SignupData = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            confirm_password
        } = req.body;

        if (!name || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await SignUpModel.findOne({
            email: { $regex: `^${normalizedEmail}$`, $options: "i" }
        });

        if (user) {
            return res.json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const Signup = new SignUpModel({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            confirm_password: hashedPassword
        });

        const result = await Signup.save();

        const token = jwt.sign(
            {
                userId: result._id,
                email: normalizedEmail
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: "Signup successful",
            data: result
        });

    } catch (error) {
        console.log("SIGNUP ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Signup failed",
            error: error.message
        });
    }
};


const SendForgotOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await SignUpModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" }
        });

        if (!user) {
            return res.json({
                success: false,
                message: "Email not registered"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        otpStore[`forgot_${email}`] = {
            otp: otp,
            expires: Date.now() + 3 * 60 * 1000
        };

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "FashionHub Password Reset OTP",
            text: `Your FashionHub password reset OTP is ${otp}. This OTP is valid for 3 minutes.`
        });

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log("FORGOT OTP ERROR:", error);

        res.status(500).json({
            success: false,
            message: "OTP sending failed"
        });
    }
};


const ResetUserPassword = async (req, res) => {
    try {
        const {
            email,
            otp,
            password,
            confirmPassword
        } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !otp || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const storedOTP = otpStore[`forgot_${normalizedEmail}`];

        if (!storedOTP) {
            return res.json({
                success: false,
                message: "Please get OTP first"
            });
        }

        if (Date.now() > storedOTP.expires) {
            delete otpStore[`forgot_${normalizedEmail}`];

            return res.json({
                success: false,
                message: "OTP expired"
            });
        }

        if (Number(otp) !== storedOTP.otp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const user = await SignUpModel.findOne({
            email: { $regex: `^${normalizedEmail}$`, $options: "i" }
        });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.confirm_password = hashedPassword;

        await user.save();

        delete otpStore[`forgot_${normalizedEmail}`];

        res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.log("RESET PASSWORD ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Password reset failed"
        });
    }
};


SignupData.SendOTP = SendOTP;
SignupData.VerifyOTP = VerifyOTP;
SignupData.SendForgotOTP = SendForgotOTP;
SignupData.ResetUserPassword = ResetUserPassword;

module.exports = SignupData;
