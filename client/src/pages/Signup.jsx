
// export default Signup;
import React, { useEffect, useState } from "react";
import "./css/Signup.css";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();

    const [SignUp, SetSignup] = useState({
        "name": '',
        "email": '',
        "password": '',
        "confirm_password": ''
    })

    const [Login, SetLogin] = useState({
        "email": '',
        "password": '',
    })

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const GetOTP = async () => {
        if (!SignUp.email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            const result = await axios.post(
                "http://localhost:4000/SendOTP",
                {
                    email: SignUp.email
                }
            );

            if (result.data.success) {
                setOtpSent(true);
                setTimer(60);
                setOtp("");
                toast.success("OTP sent to your email");
            } else {
                toast.error(result.data.message);
            }

        } catch (error) {
            toast.error(
                error.response?.data?.message || "OTP sending failed"
            );
        }
    };

    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Signup code start
        if (isSignup) {
            if (!otpSent) {
                toast.error("Please get OTP first");
                return;
            }

            if (!otp) {
                toast.error("Please enter OTP");
                return;
            }

            if (SignUp.password !== SignUp.confirm_password) {
                toast.error("Password and Confirm Password must be same or ");
            }
            else if (SignUp.password.length < 8) {
                toast.error("Password less than 8");
            } else {
                try {

                    const result = await axios.post(
                        "http://localhost:4000/VerifyOTP",
                        {
                            ...SignUp,
                            otp: otp
                        },{
                            withCredentials: true
                        }
                    );

                    if (result.data.success) {
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("userName", result.data.data.name);
                        localStorage.setItem("token", result.data.token);
                        toast.success(
                            `Welcome to fashionHub ${result.data.data.name}`
                        )
                        navigate('/');
                    }
                    else {
                        toast.error(result.data.message);
                    }

                } catch (error) {
                    toast.error(
                        error.response?.data?.message || "Signup failed"
                    );
                }
            }
        }

        // Signup code end

        // LOGIN CODE
        else {
            try {
                const result = await axios.post(
                    "http://localhost:4000/LoginData", Login, { withCredentials: true });
                if (result.data.success) {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", result.data.data.name);
                    localStorage.setItem("token", result.data.token);
                    navigate("/");
                    toast.success(
                        `Welcome to fashionHub ${result.data.data.name}`
                    )

                } else {
                    toast.error(result.data.message);
                }

            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Login failed"
                );
            }
        }
    };

    const InputHandler = (e) => {
        const { name, value } = e.target;

        if (isSignup) {
            SetSignup((prev) => ({
                ...prev,
                [name]: value
            }));
        } else {
            SetLogin((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                {/* LEFT SIDE */}
                <div className="login-left">
                    <div className="brand-content">

                        <div className="brand-logo">
                            FASHION<span>HUB</span>
                        </div>

                        <div className="brand-line"></div>

                        <h1>
                            Style that
                            <span> speaks.</span>
                        </h1>

                        <p>
                            Discover your style.<br />
                            Wear your confidence.
                        </p>

                        <div className="brand-bottom">
                            FASHION • STYLE • CONFIDENCE
                        </div>

                    </div>
                </div>


                {/* RIGHT SIDE */}
                <div className="login-right">

                    <div className="back-shop">
                        <a href="/">← Back to Shop</a>
                    </div>

                    <div className="login-box">

                        <div className="fashionhub-title">
                            <h2>FASHIONHUB</h2>
                            <p>STYLE THAT SPEAKS</p>
                        </div>

                        <div className="welcome-section">

                            <div className="welcome-icon">
                                {isSignup ? "♙" : "🔒"}
                            </div>

                            <h3>
                                {isSignup ? "Create Account" : "Welcome Back"}
                            </h3>

                            <p>
                                {isSignup
                                    ? "Create your FashionHub account"
                                    : "Login to continue to FashionHub"}
                            </p>

                        </div>


                        <form method="post" onSubmit={handleSubmit}>

                            {isSignup && (
                                <div className="input-box">
                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        onChange={InputHandler}
                                    />
                                </div>
                            )}


                            <div className="input-box">
                                <label>Email Address</label>

                                <div className="email-otp-box">

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        onChange={InputHandler}
                                    />

                                    {isSignup && (
                                        <button
                                            type="button"
                                            className="get-otp-btn"
                                            onClick={GetOTP}
                                            disabled={timer > 0}
                                        >
                                            {timer > 0
                                                ? `RESEND OTP (${timer}s)`
                                                : "GET OTP"}
                                        </button>
                                    )}

                                </div>
                            </div>


                            {isSignup && otpSent && (
                                <div className="input-box">
                                    <label>Enter OTP</label>

                                    <input
                                        type="text"
                                        value={otp}
                                        placeholder="Enter 6 digit OTP"
                                        maxLength="6"
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            )}


                            <div className="input-box">
                                <label>Password</label>

                                <div className="password-box">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        onChange={InputHandler}
                                    />

                                    <button
                                        type="button"
                                        className="show-password-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>


                            {isSignup && (
                                <div className="input-box">
                                    <label>Confirm Password</label>

                                    <div className="password-box">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirm_password"
                                            placeholder="Confirm your password"
                                            onChange={InputHandler}
                                        />

                                        <button
                                            type="button"
                                            className="show-password-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                            )}


                            {!isSignup && (
                                <div className="login-options">

                                    <div className="remember">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                        />

                                        <label htmlFor="remember">
                                            Remember me
                                        </label>
                                    </div>

                                    <Link to="/userforgot" >
                                        Forgot Password?
                                    </Link>

                                </div>
                            )}


                            <button
                                type="submit"
                                className="login-btn"
                            >
                                {isSignup
                                    ? "CREATE ACCOUNT"
                                    : "LOGIN"}
                            </button>

                        </form>


                        <div className="divider">
                            <span>OR</span>
                        </div>


                        <button className="google-btn">
                            <span>G</span>
                            Continue with Google
                        </button>


                        <p className="switch-text">

                            {isSignup
                                ? "Already have an account?"
                                : "Don't have an account?"}

                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setOtp("");
                                    setOtpSent(false);
                                    setTimer(0);
                                    setShowPassword(false);
                                    setShowConfirmPassword(false);
                                }}
                            >
                                {isSignup ? " Login" : " Sign Up"}
                            </button>

                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;