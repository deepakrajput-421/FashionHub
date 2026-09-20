
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaTrash } from "react-icons/fa";
import Navbar from "../component/navbar";
import Contact from "../component/contact";
import About from "../component/About";
import { toast } from "react-toastify";
import "./css/Wishlist.css";

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const getWishlist = async () => {
        try {
            const res = await axios.get(
                "http://localhost:4000/wishlist",
                {
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setWishlist(res.data.items || []);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Please login first");
                navigate("/Signup");
                return;
            }

            toast.error(
                error.response?.data?.message || "Unable to load wishlist"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getWishlist();
    }, []);

    const removeWishlist = async (productId) => {
        try {
            const res = await axios.delete(
                `http://localhost:4000/wishlist/${productId}`,
                {
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setWishlist(prev =>
                    prev.filter(item => item.productId?._id !== productId)
                );

                window.dispatchEvent(new Event("wishlist-updated"));
                toast.success("Removed from wishlist");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to remove from wishlist"
            );
        }
    };

    if (loading) {
        return (
            <div className="wishlist-page">
                <Navbar />
                <div className="wishlist-loading">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <Navbar />

            <div className="wishlist-container">
                <div className="wishlist-heading">
                    <span>YOUR FAVORITES</span>
                    <h1>My Wishlist</h1>
                </div>

                {wishlist.length === 0 ? (
                    <div className="wishlist-empty">
                        <FaHeart />
                        <h2>Your Wishlist is Empty</h2>
                        <p>
                            Save your favorite products here and shop them
                            whenever you want.
                        </p>

                        <button onClick={() => navigate("/shop")}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map(item => {
                            const product = item.productId;

                            if (!product) return null;

                            return (
                                <div
                                    className="wishlist-card"
                                    key={product._id}
                                >
                                    <div
                                        className="wishlist-image"
                                        onClick={() =>
                                            navigate(
                                                `/product/${product._id}`
                                            )
                                        }
                                    >
                                        <img
                                            src={`http://localhost:4000/uploads/${product.image}`}
                                            alt={product.ClothName}
                                        />

                                        <button
                                            className="wishlist-remove"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                removeWishlist(product._id);
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="wishlist-content">
                                        <p>{product.category}</p>

                                        <h3
                                            onClick={() =>
                                                navigate(
                                                    `/product/${product._id}`
                                                )
                                            }
                                        >
                                            {product.ClothName}
                                        </h3>

                                        <span>{product.detail}</span>

                                        <div className="wishlist-bottom">
                                            <strong>
                                                ₹{product.price}
                                            </strong>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/product/${product._id}`
                                                    )
                                                }
                                            >
                                                View Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Contact />
            <About />
        </div>
    );
};

export default Wishlist;

