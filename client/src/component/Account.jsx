
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaBoxOpen,
    FaHeart,
    FaShoppingCart,
    FaMapMarkerAlt,
    FaLock,
    FaSignOutAlt,
    FaUserShield,
    FaSignInAlt
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./css/Account.css";
import Navbar from "./navbar";
import axios from "axios";

const Account = () => {
    const navigate = useNavigate();

    const [activeMenu, setActiveMenu] = useState("profile");

    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );

    const [userName, setUserName] = useState(
        localStorage.getItem("userName") || "User"
    );

    const [address, setAddress] = useState(null);
    const [addressLoading, setAddressLoading] = useState(false);

    useEffect(() => {
        const checkLogin = () => {
            const loggedIn =
                localStorage.getItem("isLoggedIn") === "true";

            setIsLoggedIn(loggedIn);
            setUserName(
                localStorage.getItem("userName") || "User"
            );
        };

        window.addEventListener("auth-changed", checkLogin);

        return () => {
            window.removeEventListener("auth-changed", checkLogin);
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAddress();
        }
    }, [isLoggedIn]);

    const fetchAddress = async () => {
        try {
            setAddressLoading(true);

            const response = await axios.get(
                "http://localhost:4000/address",
                {
                    withCredentials: true
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setAddress(data.length > 0 ? data[0] : null);
            } else if (data?.address) {
                setAddress(data.address);
            } else if (data?.AddressData) {
                if (Array.isArray(data.AddressData)) {
                    setAddress(
                        data.AddressData.length > 0
                            ? data.AddressData[0]
                            : null
                    );
                } else {
                    setAddress(data.AddressData);
                }
            } else {
                setAddress(data || null);
            }
        } catch (error) {
            console.log("Address fetch error:", error);

            if (error.response?.status === 404) {
                setAddress(null);
            }
        } finally {
            setAddressLoading(false);
        }
    };

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);

        if (menu === "orders") {
            navigate("/orders");
        }

        if (menu === "wishlist") {
            navigate("/wishlist");
        }

        if (menu === "cart") {
            navigate("/cart");
        }

        if (menu === "address") {
            fetchAddress();
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:4000/logout",
                {},
                {
                    withCredentials: true
                }
            );
        } catch (error) {
            console.log("Logout error:", error);
        }

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        sessionStorage.removeItem("checkoutAddress");
        sessionStorage.removeItem("checkoutCoupon");

        setIsLoggedIn(false);
        setUserName("User");
        setAddress(null);

        window.dispatchEvent(new Event("auth-changed"));
        window.dispatchEvent(new Event("cart-updated"));

        toast.success("Logout successful");
        navigate("/");
    };

    const handleLogin = () => {
        navigate("/Signup");
    };

    if (!isLoggedIn) {
        return (
            <div className="fh-account-page">
                <Navbar />

                <div className="fh-account-container">

                    <div className="fh-account-heading">
                        <h1>My Account</h1>
                        <p>Please login to manage your account</p>
                    </div>

                    <div className="fh-account-layout">

                        <aside className="fh-account-sidebar">

                            <div className="fh-account-user-box">
                                <div className="fh-account-avatar">
                                    <FaUser />
                                </div>

                                <div>
                                    <h3>Guest User</h3>
                                    <p>Please login first</p>
                                </div>
                            </div>

                            <div className="fh-account-menu">

                                <button
                                    type="button"
                                    className="fh-account-menu-item fh-account-admin"
                                    onClick={handleLogin}
                                >
                                    <FaSignInAlt />
                                    <span>Signup / Login</span>
                                </button>

                                <div className="fh-account-menu-divider"></div>

                                <button
                                    type="button"
                                    className="fh-account-menu-item fh-account-admin"
                                    onClick={() => navigate("/login")}
                                >
                                    <FaUserShield />
                                    <span>Admin Panel</span>
                                </button>

                            </div>

                        </aside>

                        <main className="fh-account-content">

                            <div className="fh-account-section">

                                <div className="fh-account-section-header">
                                    <h2>Welcome to FashionHub</h2>
                                    <p>Please login or signup to continue.</p>
                                </div>

                                <div className="fh-account-profile-card">

                                    <div className="fh-account-profile-info">
                                        <h3>Guest User</h3>
                                        <p>
                                            Login to view your profile,
                                            orders, wishlist and saved
                                            addresses.
                                        </p>

                                        <button
                                            type="button"
                                            className="fh-account-password-btn"
                                            onClick={handleLogin}
                                        >
                                            Signup / Login
                                        </button>
                                    </div>

                                </div>

                            </div>

                        </main>

                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="fh-account-page">

            <Navbar />

            <div className="fh-account-container">

              

                <div className="fh-account-layout">

                    <aside className="fh-account-sidebar">
                        <div className="fh-account-heading">
                                <h1>My Account</h1>
                                <p>Manage your account and orders</p>
                        </div>
                        <div className="fh-account-user-box">

                            <div className="fh-account-avatar">
                                <FaUser />
                            </div>

                            <div>
                                <h3>{userName}</h3>
                                <p>Welcome back</p>
                            </div>

                        </div>

                        <div className="fh-account-menu">

                            <button
                                type="button"
                                className={`fh-account-menu-item ${
                                    activeMenu === "profile" ? "active" : ""
                                }`}
                                onClick={() => setActiveMenu("profile")}
                            >
                                <FaUser />
                                <span>My Profile</span>
                            </button>

                            <button
                                type="button"
                                className="fh-account-menu-item"
                                onClick={() => handleMenuClick("orders")}
                            >
                                <FaBoxOpen />
                                <span>My Orders</span>
                            </button>

                            <button
                                type="button"
                                className="fh-account-menu-item"
                                onClick={() => handleMenuClick("wishlist")}
                            >
                                <FaHeart />
                                <span>Wishlist</span>
                            </button>

                            <button
                                type="button"
                                className="fh-account-menu-item"
                                onClick={() => handleMenuClick("cart")}
                            >
                                <FaShoppingCart />
                                <span>My Cart</span>
                            </button>

                            <button
                                type="button"
                                className={`fh-account-menu-item ${
                                    activeMenu === "address" ? "active" : ""
                                }`}
                                onClick={() => handleMenuClick("address")}
                            >
                                <FaMapMarkerAlt />
                                <span>My Addresses</span>
                            </button>
                            <div className="fh-account-menu-divider"></div>

                            <button
                                type="button"
                                className="fh-account-menu-item fh-account-admin"
                                onClick={() => navigate("/login")}
                            >
                                <FaUserShield />
                                <span>Admin Panel</span>
                            </button>

                            <button
                                type="button"
                                className="fh-account-menu-item fh-account-logout"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>

                        </div>

                    </aside>

                    <main className="fh-account-content">

                        {activeMenu === "profile" && (
                            <div className="fh-account-section">

                                <div className="fh-account-section-header">
                                    <h2>My Profile</h2>
                                    <p>Welcome back, {userName}!</p>
                                </div>

                                <div className="fh-account-profile-card">

                                    <div className="fh-account-profile-avatar">
                                        <FaUser />
                                    </div>

                                    <div className="fh-account-profile-info">
                                        <h3>{userName}</h3>
                                        <p>
                                            Manage your personal information
                                            and account details.
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                        {activeMenu === "address" && (
                            <div className="fh-account-section">

                                <div className="fh-account-section-header">
                                    <h2>My Addresses</h2>
                                    <p>Manage your delivery addresses</p>
                                </div>

                                {addressLoading ? (
                                    <div className="fh-account-empty">
                                        <FaMapMarkerAlt />
                                        <h3>Loading Address...</h3>
                                    </div>
                                ) : address ? (
                                    <div className="fh-account-profile-card">
                                        <div className="fh-account-profile-info">
                                            <h3>{address.name}</h3>

                                            <p>
                                                <strong>Phone:</strong>{" "}
                                                {address.phone}
                                            </p>

                                            <p>
                                                <strong>Address:</strong>{" "}
                                                {address.address}
                                            </p>

                                            <p>
                                                <strong>City:</strong>{" "}
                                                {address.city}
                                            </p>

                                            <p>
                                                <strong>State:</strong>{" "}
                                                {address.state}
                                            </p>

                                            <p>
                                                <strong>Pincode:</strong>{" "}
                                                {address.pincode}
                                            </p>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="fh-account-empty">
                                        <FaMapMarkerAlt />
                                        <h3>No Address Added</h3>
                                        <p>
                                            Your saved delivery addresses will
                                            appear here.
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}


                    </main>

                </div>

            </div>

        </div>
    );
};

export default Account;
