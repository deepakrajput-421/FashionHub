import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/collection.css";
import { useNavigate } from "react-router-dom";

export const Collection = () => {
    const [GetData, setGetData] = useState([]);
    const navigate = useNavigate();

    const [selectedSizes, setSelectedSizes] = useState({});
    const [wishlist, setWishlist] = useState({});

    const Clothdata = async () => {
        try {
            const result = await axios.get(`https://fashionhub-tj47.onrender.com/GetData`);
            setGetData(result.data.ClothData || []);
        } catch (error) {
            console.log("GET CLOTH ERROR:", error);
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

            const items =
                response.data?.wishlist?.items ||
                response.data?.items ||
                response.data?.WishlistData ||
                [];

            const wishlistData = {};

            items.forEach((item) => {
                const productId =
                    item.productId?._id ||
                    item.productId ||
                    item._id;

                if (productId) {
                    wishlistData[String(productId)] = true;
                }
            });

            setWishlist(wishlistData);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.log("GET WISHLIST ERROR:", error);
            }

            setWishlist({});
        }
    };

  useEffect(() => {
    const loadCollection = async () => {
        await Promise.all([
            Clothdata(),
            getWishlist()
        ]);

        window.dispatchEvent(
            new CustomEvent("home-section-loaded", {
                detail: "collection"
            })
        );
    };

    loadCollection();

    const handleWishlistUpdate = () => {
        getWishlist();
    };

    window.addEventListener(
        "wishlist-updated",
        handleWishlistUpdate
    );

    return () => {
        window.removeEventListener(
            "wishlist-updated",
            handleWishlistUpdate
        );
    };
}, []);

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

            if (response.data?.success) {
                const wishlisted =
                    response.data.wishlisted ??
                    response.data.isWishlisted ??
                    !wishlist[String(productId)];

                setWishlist((prev) => ({
                    ...prev,
                    [String(productId)]: wishlisted
                }));

                window.dispatchEvent(
                    new Event("wishlist-updated")
                );
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/Signup");
                return;
            }

            console.log("WISHLIST ERROR:", error);
        }
    };

    const getDiscount = (item, index) => {
        if (item.discount) {
            return Number(item.discount);
        }

        const discounts = [20, 15, 25, 10];

        return discounts[index % discounts.length];
    };

    const getRating = (item, index) => {
        if (item.rating) {
            return Number(item.rating);
        }

        const ratings = [4.5, 4.3, 4.6, 4.2];

        return ratings[index % ratings.length];
    };

    const getReviews = (item, index) => {
        if (item.reviews) {
            return Number(item.reviews);
        }

        const reviews = [128, 96, 75, 53];

        return reviews[index % reviews.length];
    };

    const getOldPrice = (price, discount) => {
        const currentPrice = Number(price);

        if (!currentPrice) {
            return 0;
        }

        return Math.round(
            currentPrice / (1 - discount / 100)
        );
    };

    const getProductSizes = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            return item.sizes.map(
                (sizeItem) => sizeItem.size
            );
        }

        return [];
    };

    const getSelectedSizeData = (item) => {
        const sizes = item.sizes || [];

        const selectedSize =
            selectedSizes[item._id] ||
            sizes[0]?.size;

        return sizes.find(
            (sizeItem) =>
                String(sizeItem.size) ===
                String(selectedSize)
        );
    };

    return (
        <section
            className="collection-page"
            id="collection"
        >

            <div className="collection-container">

                <div className="collection-top">

                    <div className="collection-title">

                        <span>
                            FASHIONHUB COLLECTION
                        </span>

                        <h1>
                            Our Collection
                        </h1>

                        <p>
                            Premium quality fashion, crafted for you
                        </p>

                    </div>

                </div>

                <div className="products-heading">

                    <h2>
                        Our Products
                    </h2>

                    <span>
                        {GetData.length} Products
                    </span>

                </div>

                <div className="collection-grid">

                    {GetData.length > 0 ? (

                        GetData.slice(0, 8).map(
                            (item, index) => {

                                const discount =
                                    getDiscount(
                                        item,
                                        index
                                    );

                                const rating =
                                    getRating(
                                        item,
                                        index
                                    );

                                const reviews =
                                    getReviews(
                                        item,
                                        index
                                    );

                                const oldPrice =
                                    getOldPrice(
                                        item.price,
                                        discount
                                    );

                                const sizes =
                                    getProductSizes(item);

                                const selectedSizeData =
                                    getSelectedSizeData(item);

                                const selectedStock =
                                    Number(
                                        selectedSizeData?.stock ||
                                        0
                                    );

                                const isWishlisted =
                                    wishlist[String(item._id)] === true;

                                return (

                                    <div
                                        className="product-card"
                                        key={
                                            item._id ||
                                            index
                                        }
                                        onClick={() =>
                                            navigate(
                                                `/product/${item._id}`
                                            )
                                        }
                                    >

                                        <div className="collection-product-image-wrapper">

                                            <img
                                                src={`https://fashionhub-tj47.onrender.com/uploads/${item.image}`}
                                                alt={
                                                    item.ClothName ||
                                                    "Product"
                                                }
                                                className="collection-product-image"
                                            />

                                            <span className="discount-badge">
                                                -{discount}%
                                            </span>

                                            <button
                                                type="button"
                                                className={`collection-wishlist-btn ${isWishlisted ? "active" : ""}`}
                                                onClick={(e) =>
                                                    toggleWishlist(
                                                        e,
                                                        item._id
                                                    )
                                                }
                                            >
                                                {isWishlisted
                                                    ? "♥"
                                                    : "♡"}
                                            </button>

                                        </div>

                                        <div className="collection-product-info">

                                            <span className="collection-product-category">
                                                {item.category}
                                            </span>

                                            <h2>
                                                {item.ClothName}
                                            </h2>

                                            <div className="rating-row">

                                                <span className="star">
                                                    ★
                                                </span>

                                                <span className="rating-number">
                                                    {rating}
                                                </span>

                                                <span className="review-count">
                                                    ({reviews})
                                                </span>

                                            </div>

                                            <div className="collection-price-row">

                                                <span className="current-price">
                                                    ₹
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                                <span className="old-price">
                                                    ₹
                                                    {oldPrice.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                                <span className="off-text">
                                                    {discount}% OFF
                                                </span>

                                            </div>

                                            <div className="size-section">

                                                <p>
                                                    Select Size
                                                </p>

                                                <div className="collection-sizes">

                                                    {sizes.length > 0 ? (

                                                        sizes.map(
                                                            (size) => {

                                                                const isSelected =
                                                                    String(
                                                                        selectedSizeData?.size
                                                                    ).toUpperCase() ===
                                                                    String(
                                                                        size
                                                                    ).toUpperCase();

                                                                const sizeData =
                                                                    item.sizes.find(
                                                                        (sizeItem) =>
                                                                            String(
                                                                                sizeItem.size
                                                                            ) ===
                                                                            String(
                                                                                size
                                                                            )
                                                                    );

                                                                const sizeStock =
                                                                    Number(
                                                                        sizeData?.stock ||
                                                                        0
                                                                    );

                                                                return (

                                                                    <button
                                                                        type="button"
                                                                        key={size}
                                                                        disabled={
                                                                            sizeStock <= 0
                                                                        }
                                                                        className={
                                                                            isSelected
                                                                                ? "collection-size-btn selected"
                                                                                : "collection-size-btn"
                                                                        }
                                                                        onClick={(e) => {

                                                                            e.stopPropagation();

                                                                            setSelectedSizes(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [item._id]:
                                                                                        size
                                                                                })
                                                                            );

                                                                        }}
                                                                    >

                                                                        {size}

                                                                    </button>

                                                                );

                                                            }
                                                        )

                                                    ) : (

                                                        <span>
                                                            No Size Available
                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                            <div className="stock-row">

                                                <span
                                                    className={
                                                        selectedStock > 0
                                                            ? "stock-dot"
                                                            : "stock-dot out"
                                                    }
                                                >
                                                </span>

                                                <span>

                                                    {selectedStock > 0
                                                        ? `${selectedStock} available`
                                                        : "Out of Stock"
                                                    }

                                                </span>

                                            </div>

                                            <div className="product-buttons">

                                                <button
                                                    type="button"
                                                    className="collection-cart-btn"
                                                    disabled={
                                                        selectedStock <= 0
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/product/${item._id}`
                                                        )
                                                    }
                                                >

                                                    <span>
                                                        🛒
                                                    </span>

                                                    Add to Cart

                                                </button>

                                                <button
                                                    type="button"
                                                    className="collection-buy-btn"
                                                    disabled={
                                                        selectedStock <= 0
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/product/${item._id}`
                                                        )
                                                    }
                                                >

                                                    <span>
                                                        ⚡
                                                    </span>

                                                    Buy Now

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                );

                            }

                        )

                    ) : (

                        <div className="collection-no-products">
                            No Products Found
                        </div>

                    )}

                </div>

                {GetData.length > 8 && (

                    <div className="collection-view-all-bottom">

                        <button
                            type="button"
                            onClick={() => navigate("/shop")}
                        >
                            View All Products →
                        </button>

                    </div>

                )}

                <div className="benefits-section">

                    <div className="benefit-item">

                        <div className="benefit-icon">
                            🚚
                        </div>

                        <div>

                            <h3>
                                Free Delivery
                            </h3>

                            <p>
                                On all orders above ₹999
                            </p>

                        </div>

                    </div>

                    <div className="benefit-divider"></div>

                    <div className="benefit-item">

                        <div className="benefit-icon">
                            🛡
                        </div>

                        <div>

                            <h3>
                                Secure Payment
                            </h3>

                            <p>
                                100% secure payment
                            </p>

                        </div>

                    </div>

                    <div className="benefit-divider"></div>

                    <div className="benefit-item">

                        <div className="benefit-icon">
                            ↩
                        </div>

                        <div>

                            <h3>
                                Easy Returns
                            </h3>

                            <p>
                                7 days return policy
                            </p>

                        </div>

                    </div>

                    <div className="benefit-divider"></div>

                    <div className="benefit-item">

                        <div className="benefit-icon">
                            ◉
                        </div>

                        <div>

                            <h3>
                                Premium Quality
                            </h3>

                            <p>
                                Best quality assured
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
};


