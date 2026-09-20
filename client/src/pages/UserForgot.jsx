
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./css/UserForgot.css";

export const UserForgot = () => {
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
                "http://localhost:4000/forgot-password/send-otp",
                {
                    email: email.trim().toLowerCase()
                }
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

        if (password.length < 8) {
            setMessage("Password must be at least 8 characters");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:4000/forgot-password/reset-password",
                {
                    email: email.trim().toLowerCase(),
                    otp,
                    password,
                    confirmPassword
                }
            );

            if (res.data.success) {
                setMessage("Password reset successfully");

                setTimeout(() => {
                    navigate("/signup");
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
        <div className="forgot-password-page">

            <div className="forgot-password-container">

                <div className="forgot-password-left">
                    <div className="forgot-brand-content">

                        <div className="forgot-brand-logo">
                            FASHION<span>HUB</span>
                        </div>

                        <div className="forgot-brand-line"></div>

                        <h1>
                            Style that
                            <span> speaks.</span>
                        </h1>

                        <p>
                            Discover your style.<br />
                            Wear your confidence.
                        </p>

                        <div className="forgot-brand-bottom">
                            FASHION • STYLE • CONFIDENCE
                        </div>

                    </div>
                </div>


                <div className="forgot-password-right">

                    <div className="forgot-back-shop">
                        <button onClick={() => navigate("/")}>
                            ← Back to Shop
                        </button>
                    </div>

                    <div className="forgot-password-box">

                        <div className="forgot-fashionhub-title">
                            <h2>FASHIONHUB</h2>
                            <p>STYLE THAT SPEAKS</p>
                        </div>


                        {step === 1 && (
                            <form onSubmit={sendOTP}>

                                <div className="forgot-welcome-section">
                                    <div className="forgot-welcome-icon">
                                        🔑
                                    </div>

                                    <h3>Forgot Password</h3>

                                    <p>
                                        Enter your registered email to reset
                                        your password
                                    </p>
                                </div>

                                <div className="forgot-input-box">
                                    <label>Email Address</label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                {message && (
                                    <p className="forgot-message">
                                        {message}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="forgot-login-btn"
                                    disabled={loading}
                                >
                                    {loading ? "SENDING..." : "SEND OTP"}
                                </button>

                                <button
                                    type="button"
                                    className="forgot-back-login"
                                    onClick={() => navigate("/Signup")}
                                >
                                    Back to Login
                                </button>

                            </form>
                        )}


                        {step === 2 && (
                            <form onSubmit={resetPassword}>

                                <div className="forgot-welcome-section">
                                    <div className="forgot-welcome-icon">
                                        🔐
                                    </div>

                                    <h3>Reset Password</h3>

                                    <p>
                                        Enter OTP and create your new password
                                    </p>
                                </div>


                                <div className="forgot-input-box">
                                    <label>Enter OTP</label>

                                    <input
                                        type="text"
                                        placeholder="Enter 6 digit OTP"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        maxLength="6"
                                        required
                                    />
                                </div>


                                <div className="forgot-input-box">
                                    <label>New Password</label>

                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="forgot-input-box">
                                    <label>Confirm Password</label>

                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                {message && (
                                    <p className="forgot-message">
                                        {message}
                                    </p>
                                )}


                                <button
                                    type="submit"
                                    className="forgot-login-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "RESETTING..."
                                        : "RESET PASSWORD"}
                                </button>


                                <Link  to='/Signup' className="forgot-back-login">
                                    Back to Login
                                </Link>

                            </form>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserForgot;