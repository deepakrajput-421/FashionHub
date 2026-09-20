import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Flogo from "../assest/images/Fashionhub logo.png";
import Navbar from "../component/navbar";
import "./css/AdminForgot.css";

export const AdminForgot = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const sendOTP = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            setLoading(true);

            const res = await axios.post(
                "https://fashionhub-tj47.onrender.com/admin/send-otp",
                { email }
            );

            if (res.data.success) {
                setStep(2);
                setMessage("OTP sent successfully");
            } else {
                setMessage(res.data.message);
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message || "OTP sending failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                "https://fashionhub-tj47.onrender.com/admin/reset-password",
                {
                    email,
                    otp,
                    password,
                    confirmPassword
                }
            );

            if (res.data.success) {
                setMessage("Password reset successfully");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                setMessage(res.data.message);
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Password reset failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container loginContainer">
            <Navbar />

            <div className="Flogo mt-5">
                <img src={Flogo} alt="FashionHub" />
            </div>

            <div className="ForgotPasswordFrm">

                {step === 1 && (
                    <form onSubmit={sendOTP} className="ForgotFrm">
                        <h2>Forgot Password</h2>
                        <p>Enter your admin email to receive OTP</p>

                        <div className="form-group mt-3 frmHeading">
                            <label htmlFor="email">Email address:</label>

                            <input
                                type="email"
                                className="form-control mt-3"
                                placeholder="Enter admin email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <p className="ForgotMessage">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn loginBtn"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        <button
                            type="button"
                            className="BackLoginBtn"
                            onClick={() => navigate("/login")}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={resetPassword} className="ForgotFrm">
                        <h2>Reset Password</h2>
                        <p>Enter OTP and create your new password</p>

                        <div className="form-group mt-3 frmHeading">
                            <label htmlFor="otp">OTP:</label>

                            <input
                                type="text"
                                className="form-control mt-3"
                                placeholder="Enter 6 digit OTP"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                                required
                            />
                        </div>

                        <div className="form-group mt-3 frmHeading">
                            <label htmlFor="password">New Password:</label>

                            <input
                                type="password"
                                className="form-control mt-3"
                                placeholder="Enter new password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group mt-3 frmHeading">
                            <label htmlFor="confirmPassword">
                                Confirm Password:
                            </label>

                            <input
                                type="password"
                                className="form-control mt-3"
                                placeholder="Confirm new password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        {message && (
                            <p className="ForgotMessage">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn loginBtn"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <button
                            type="button"
                            className="BackLoginBtn"
                            onClick={() => navigate("/login")}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};