import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import "./css/CategoryData.css";
import Navbar from "../component/navbar";
import About from "../component/About";

const CategoryData = () => {
    const { gender, category } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState({});
    const [wishlist, setWishlist] = useState({});

    useEffect(() => {
        getCategoryData();
        getWishlist();
    }, [gender, category]);

    useEffect(() => {
        const updateWishlist = () => {
            getWishlist();
        };

        window.addEventListener("wishlist-updated", updateWishlist);

        return () => {
            window.removeEventListener("wishlist-updated", updateWishlist);
        };
    }, []);

    const getCategoryData = async () => {
        try {
            const response = await axios.get(
                `https://fashionhub-tj47.onrender.com/CatData/${gender}/${category}`
            );

            setProducts(response.data.CategoryData || []);
        } catch (error) {
            console.log("CATEGORY DATA ERROR:", error);
        }
    };

    const getWishlist = async () => {
        try {
            const response = await axios.get(
                "https://fashionhub-tj47.onrender.com/wishlist",
                {
                    withCredentials: true
                }
            );

            const wishlistItems =
                response.data?.wishlist?.items ||
                response.data?.items ||
                response.data?.WishlistData ||
                [];

            const wishlistObject = {};

            wishlistItems.forEach((item) => {
                const productId =
                    item.productId?._id ||
                    item.productId;

                if (productId) {
                    wishlistObject[String(productId)] = true;
                }
            });

            setWishlist(wishlistObject);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.log("GET WISHLIST ERROR:", error);
            }

            setWishlist({});
        }
    };

    const toggleWishlist = async (event, productId) => {
        event.stopPropagation();

        try {
            const response = await axios.post(
                "https://fashionhub-tj47.onrender.com/wishlist/toggle",
                {
                    productId
                },
                {
                    withCredentials: true
                }
            );

            const wishlisted = response.data?.wishlisted;

            setWishlist((prev) => ({
                ...prev,
                [String(productId)]: wishlisted === true
            }));

            window.dispatchEvent(
                new Event("wishlist-updated")
            );
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/Signup");
                return;
            }

            console.log("WISHLIST TOGGLE ERROR:", error);
        }
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes((prev) => ({
            ...prev,
            [productId]: size
        }));
    };

    const handleAddToCart = async (event, item) => {
        event.stopPropagation();

        const selectedSize = selectedSizes[item._id];

        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }

        const selected = item.sizes?.find(
            (sizeData) =>
                sizeData.size === selectedSize
        );

        if (!selected || Number(selected.stock) <= 0) {
            toast.error("Selected size is out of stock");
            return;
        }

        try {
            await axios.post(
                "https://fashionhub-tj47.onrender.com/cart",
                {
                    productId: item._id,
                    quantity: 1,
                    size: selectedSize
                },
                {
                    withCredentials: true
                }
            );

            toast.success("Product added to cart");

            window.dispatchEvent(
                new Event("cart-updated")
            );
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Please login first");
                navigate("/Signup");
                return;
            }

            toast.error(
                error.response?.data?.message ||
                "Unable to add product to cart"
            );
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="catdata-page mt-5">

            <Navbar />

            <div className="catdata-header mt-3">
                <p>
                    FASHION HUB
                </p>

                <h1>
                    {category} Collection
                </h1>

                <span>
                    Discover our latest {category} collection
                </span>
            </div>

            <div className="catdata-container">

                <div className="catdata-top">

                    <div>

                        <h2>
                            Our Products
                        </h2>

                        <p>
                            {products.length} Products
                        </p>

                    </div>

                    <button
                        onClick={() => navigate("/")}
                    >
                        View All
                    </button>

                </div>

                <div className="catdata-grid">

                    {products.map((item) => (

                        <div
                            className="catdata-card"
                            key={item._id}
                            onClick={() =>
                                handleProductClick(item._id)
                            }
                        >

                            <div className="catdata-image">

                                <img
                                    src={`https://fashionhub-tj47.onrender.com/uploads/${item.image}`}
                                    alt={item.ClothName}
                                />

                                <button
                                    type="button"
                                    className={`heart-btn ${
                                        wishlist[String(item._id)]
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={(e) =>
                                        toggleWishlist(
                                            e,
                                            item._id
                                        )
                                    }
                                    aria-label="Wishlist"
                                >
                                    {wishlist[String(item._id)] ? (
                                        <FaHeart />
                                    ) : (
                                        "♡"
                                    )}
                                </button>

                            </div>

                            <div className="catdata-info">

                                <h3>
                                    {item.ClothName}
                                </h3>

                                <p className="product-detail">
                                    {item.detail}
                                </p>

                                <div className="catdata-rating">

                                    <span>
                                        ★
                                    </span>

                                    <span>
                                        4.5
                                    </span>

                                    <small>
                                        (128)
                                    </small>

                                </div>

                                <h4>
                                    ₹{item.price}
                                </h4>

                                <p className="catdata-size-heading">
                                    Select Size
                                </p>

                                <div className="catdata-sizes">

                                    {item.sizes?.map((sizeData) => (

                                        <button
                                            key={sizeData.size}
                                            type="button"
                                            className={
                                                selectedSizes[item._id] ===
                                                sizeData.size
                                                    ? "selected"
                                                    : ""
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                handleSizeSelect(
                                                    item._id,
                                                    sizeData.size
                                                );
                                            }}
                                        >
                                            {sizeData.size}
                                        </button>

                                    ))}

                                </div>

                                <div className="catdata-stock">

                                    {selectedSizes[item._id]
                                        ? (() => {

                                            const selected =
                                                item.sizes?.find(
                                                    (sizeData) =>
                                                        sizeData.size ===
                                                        selectedSizes[item._id]
                                                );

                                            return selected &&
                                                Number(selected.stock) > 0
                                                ? `${selected.size} - ${selected.stock} available`
                                                : `${selected?.size} - Out of Stock`;

                                        })()
                                        : "Select Size"}

                                </div>

                                <button
                                    className="add-cart"
                                    disabled={
                                        !selectedSizes[item._id] ||
                                        (() => {
                                            const selected =
                                                item.sizes?.find(
                                                    (sizeData) =>
                                                        sizeData.size ===
                                                        selectedSizes[item._id]
                                                );

                                            return (
                                                !selected ||
                                                Number(selected.stock) <= 0
                                            );
                                        })()
                                    }
                                    onClick={(e) =>
                                        handleAddToCart(e, item)
                                    }
                                >
                                    {!selectedSizes[item._id]
                                        ? "Select Size"
                                        : (() => {
                                            const selected =
                                                item.sizes?.find(
                                                    (sizeData) =>
                                                        sizeData.size ===
                                                        selectedSizes[item._id]
                                                );

                                            return selected &&
                                                Number(selected.stock) > 0
                                                ? "Add to Cart"
                                                : "Out of Stock";
                                        })()}
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            <div className="catdata-features">

                <div>
                    <strong>
                        Free Delivery
                    </strong>

                    <span>
                        On orders above ₹999
                    </span>
                </div>

                <div>
                    <strong>
                        Secure Payment
                    </strong>

                    <span>
                        100% secure payment
                    </span>
                </div>

                <div>
                    <strong>
                        Easy Returns
                    </strong>

                    <span>
                        7 days easy return
                    </span>
                </div>

                <div>
                    <strong>
                        Premium Quality
                    </strong>

                    <span>
                        Quality you can trust
                    </span>
                </div>

            </div>

            <About />

        </div>
    );
};

export default CategoryData;