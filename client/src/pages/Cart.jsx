import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaTrash, FaMinus, FaPlus, FaArrowLeft, FaArrowRight, FaShoppingBag, FaHeart, FaTruck, FaShieldAlt,
    FaHeadset, FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaEnvelope, FaPhone
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/Cart.css";
import Navbar from "../component/navbar";
import About from "../component/About";

export const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        fetchCart();

        const productData = JSON.parse(localStorage.getItem("products")) || [];
        setProducts(Array.isArray(productData) ? productData : []);
    }, []);

  const fetchCart = async () => {
    try {
        const response = await axios.get(
            "http://localhost:4000/cart",
            { withCredentials: true }
        );

        if (response.data.success) {
            const formattedCart = (response.data.items || []).map(item => ({
                ...item.productId,
                cartItemId: item._id,
                quantity: item.quantity,
                size: item.size
            }));

            setCart(formattedCart);
            window.dispatchEvent(new Event("cart-updated")); // 👈 add this
        }
    } catch (error) {
        if (error.response?.status === 401) {
            toast.error("Login required");
            navigate("/Signup");
        }
    }
};
    const getPrice = (item) => {
        return Number(item.price || item.Price || 0);
    };

    const getName = (item) => {
        return item.name || item.ClothName || item.clothname || "Product";
    };
    const getImage = (item) => {
        return `http://localhost:4000/uploads/${item.image}`;
    };

    const getStock = (item, size) => {
        const sizeData = item.sizes?.find(
            sizeItem => sizeItem.size === size
        );

        return sizeData ? Number(sizeData.stock || 0) : 0;
    };

    const updateQuantity = async (index, change) => {
        const item = cart[index];

        let quantity = (item.quantity || 1) + change;

        if (quantity < 1) {
            await removeItem(index);
            return;
        }

        if (item.size) {
            const stock = getStock(item, item.size);

            if (quantity > stock) {
                toast.error(`Only ${stock} item available in size ${item.size}`);
                return;
            }
        }

        try {
            const response = await axios.put(
                "http://localhost:4000/cart",
                {
                    itemId: item.cartItemId,
                    quantity: quantity
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                fetchCart();
            }
        } catch (error) {
            
            toast.error("Unable to update cart");
        }
    };

    const removeItem = async (index) => {
        const item = cart[index];

        try {
            const response = await axios.delete(
                "http://localhost:4000/cart",
                {
                    data: {
                        itemId: item.cartItemId
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                toast.success("Item removed from cart");
                fetchCart();
            }
        } catch (error) {
            
            toast.error("Unable to remove item");
        }
    };

    const changeSize = async (index, newSize) => {
        const item = cart[index];

        const stock = getStock(item, newSize);

        if (stock <= 0) {
            toast.error("Selected size is out of stock");
            return;
        }

        if ((item.quantity || 1) > stock) {
            toast.error(`Only ${stock} item available in size ${newSize}`);
            return;
        }

        try {
            const response = await axios.put(
                "http://localhost:4000/cart",
                {
                    itemId: item.cartItemId,
                    size: newSize
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                toast.success(`Size changed to ${newSize}`);
                fetchCart();
            }
        } catch (error) {
            
            toast.error("Unable to change size");
        }
    };

   const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
        toast.error("Enter coupon code");
        return;
    }

    const subtotalAmount = cart.reduce(
        (total, item) =>
            total + getPrice(item) * (item.quantity || 1),
        0
    );

    if (subtotalAmount <= 0) {
        toast.error("Your cart is empty");
        return;
    }

    try {
        const response = await axios.post(
            "http://localhost:4000/applycoupon",
            {
                code: code,
            },
            {
                withCredentials: true
            }
        );
        if (response.data.success) {

            const appliedDiscount = Number(response.data.discount || 0);

            setDiscount(appliedDiscount);

            sessionStorage.setItem(
                "checkoutCoupon",
                JSON.stringify({
                    code: code,
                    discount: appliedDiscount
                })
            );

            toast.success(
                `${response.data.coupon} applied successfully`
            );
        }

    } catch (error) {
        setDiscount(0);
        if (error.response?.status === 401) {
            toast.error("Please login first");
            navigate("/Signup");
            return;
        }

        toast.error(
            error.response?.data?.message ||
            "Invalid coupon code"
        );
    }
};

    const subtotal = cart.reduce(
        (total, item) =>
            total + getPrice(item) * (item.quantity || 1),
        0
    );

    const delivery = 0;

    const total = Math.max(
        subtotal + delivery - discount,
        0
    );

    const recommendedProducts = products
        .filter(product =>
            !cart.some(item => item._id === product._id)
        )
        .slice(0, 5);

    const addRecommendedToCart = async (product) => {
        if (product.sizes?.length > 0) {
            toast.info("Please select size from product page");
            navigate(`/product/${product._id}`);
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:4000/cart",
                {
                    productId: product._id,
                    quantity: 1,
                    size: null
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                toast.success("Added to cart");
                fetchCart();
            }
        } catch (error) {
            

            if (error.response?.status === 401) {
                toast.error("Login required");
                navigate("/Signup");
                return;
            }

            toast.error("Unable to add product");
        }
    };

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                     <Navbar/>
                <div className="empty-cart">

                    <div className="empty-cart-icon">
                        <FaShoppingBag />
                    </div>

                    <h1>
                        Your Cart is Empty
                    </h1>

                    <p>
                        Looks like you haven't added anything to your cart yet.
                    </p>

                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate("/shop")}
                    >
                        <FaArrowLeft />
                        CONTINUE SHOPPING
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">

            <Navbar />

            <div className="cart-main ">

                <div className="cart-breadcrumb mt-4">
                    Home
                    <span>›</span>
                    Shopping Cart
                </div>

                <h1 className="cart-title">
                    Shopping Cart
                </h1>

                <div className="cart-layout">

                    <div className="cart-products-area">

                        <div className="cart-table-head">
                            <span>PRODUCTS</span>
                            <span>PRICE</span>
                            <span>QUANTITY</span>
                            <span>SUBTOTAL</span>
                        </div>

                        {cart.map((item, index) => (

                            <div
                                className="cart-product-row"
                                key={`${item._id}-${item.size || "default"}-${index}`}
                            >

                                <div className="cart-product-info">

                                    <div className="cart-product-image">
                                        <img
                                            src={getImage(item)}
                                            alt={getName(item)}
                                        />
                                    </div>

                                    <div className="cart-product-text">

                                        <h3>
                                            {getName(item)}
                                        </h3>

                                        <p>
                                            Size:
                                            <b>
                                                {item.size || "N/A"}
                                            </b>
                                        </p>

                                        <p>
                                            Category:
                                            <b>
                                                {item.category || item.CategoryName || "Fashion"}
                                            </b>
                                        </p>

                                    </div>

                                </div>

                                <div className="cart-price">
                                    ₹ {getPrice(item).toLocaleString("en-IN")}
                                </div>

                                <div className="cart-quantity">

                                    <button
                                        onClick={() =>
                                            updateQuantity(index, -1)
                                        }
                                    >
                                        <FaMinus />
                                    </button>

                                    <span>
                                        {item.quantity || 1}
                                    </span>

                                    <button
                                        onClick={() =>
                                            updateQuantity(index, 1)
                                        }
                                    >
                                        <FaPlus />
                                    </button>

                                </div>

                                <div className="cart-subtotal">

                                    ₹
                                    {(
                                        getPrice(item) *
                                        (item.quantity || 1)
                                    ).toLocaleString("en-IN")}

                                    <div className="cart-actions">

                                        <button onClick={() =>removeItem(index)} >
                                            <FaTrash />
                                        </button>

                                    </div>

                                </div>

                                {item.sizes?.length > 0 && (
                                    <div className="cart-size-selector">

                                        <span>SELECT SIZE</span>

                                        <div>

                                            {item.sizes.map((sizeItem, sizeIndex) => {

                                                const stock = Number(sizeItem.stock || 0);
                                                const selected = item.size === sizeItem.size;

                                                return (
                                                    <div
                                                        className="cart-size-box"
                                                        key={sizeIndex}
                                                    >

                                                        <button
                                                            disabled={stock <= 0}
                                                            className={
                                                                selected
                                                                    ? "cart-size-btn selected"
                                                                    : stock <= 0
                                                                        ? "cart-size-btn out"
                                                                        : "cart-size-btn"
                                                            }
                                                            onClick={() =>
                                                                changeSize(index, sizeItem.size)
                                                            }
                                                        >
                                                            <b>{sizeItem.size}</b>
                                                        </button>

                                                        <small>
                                                            {stock > 0
                                                                ? `${stock} available`
                                                                : "Out of stock"}
                                                        </small>

                                                    </div>
                                                );
                                            })}

                                        </div>

                                    </div>
                                )}

                            </div>

                        ))}

                        <button
                            className="continue-btn"
                            onClick={() => navigate("/shop")}
                        >
                            <FaArrowLeft />
                            Continue Shopping
                        </button>

                    </div>

                    <div className="cart-order-summary">

                        <div className="summary-top">

                            <h2>
                                Order Summary
                            </h2>

                            <div className="summary-bag">
                                <FaShoppingBag />
                            </div>

                        </div>

                        <div className="coupon-box">

                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={coupon}
                                onChange={e =>
                                    setCoupon(e.target.value)
                                }
                            />

                            <button onClick={applyCoupon}>
                                Apply
                            </button>

                        </div>

                        <div className="summary-details">

                            <div className="summary-row">

                                <span>
                                    Order Subtotal
                                </span>

                                <strong>
                                    ₹ {subtotal.toLocaleString("en-IN")}
                                </strong>

                            </div>

                            <div className="summary-row">

                                <span>
                                    Shipping Cost
                                </span>

                                <strong className="free">
                                    FREE
                                </strong>

                            </div>

                            <div className="summary-row">

                                <span>
                                    Discount
                                </span>

                                <strong className="discount">
                                    - ₹ {discount.toLocaleString("en-IN")}
                                </strong>

                            </div>

                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">

                            <div>

                                <span>
                                    Total Amount
                                </span>

                                <small>
                                    Inclusive of all taxes
                                </small>

                            </div>

                            <strong>
                                ₹ {total.toLocaleString("en-IN")}
                            </strong>

                        </div>

                        <button
                            className="checkout-button"
                            onClick={() =>
                                navigate("/delivery-address")
                            }
                        >
                            Proceed To Checkout
                            <FaArrowRight />
                        </button>

                        <div className="cart-secure-checkout">
                            🔒 Secure Checkout
                        </div>

                    </div>

                </div>

            </div>

            {recommendedProducts.length > 0 && (

                <section className="recommend-section">

                    <div className="recommend-container">

                        <h2>
                            Products You May Like
                        </h2>

                        <div className="recommend-grid">

                            {recommendedProducts.map(
                                (product, index) => (

                                    <div
                                        className="recommend-card"
                                        key={product._id || index}
                                    >

                                        <div className="recommend-image">

                                            <img
                                                src={getImage(product)}
                                                alt={getName(product)}
                                            />

                                            <button>
                                                <FaHeart />
                                            </button>

                                        </div>

                                        <div className="recommend-info">

                                            <div className="recommend-rating">

                                                <span>
                                                    Best seller
                                                </span>

                                                <span>
                                                    ⭐ 4.6
                                                </span>

                                            </div>

                                            <p>
                                                {getName(product)}
                                            </p>

                                            <div className="recommend-price">

                                                <strong>
                                                    ₹
                                                    {getPrice(product).toLocaleString("en-IN")}
                                                </strong>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    addRecommendedToCart(product)
                                                }
                                            >
                                                <FaShoppingBag />
                                                Add to Cart
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </section>

            )}

            <section className="service-section">

                <div className="service-container">

                    <div className="service-box">
                        <FaTruck />
                        <div>
                            <h4>
                                Fast & Free Shipping
                            </h4>
                            <p>
                                On all orders over ₹999
                            </p>
                        </div>
                    </div>

                    <div className="service-box">
                        <FaShieldAlt />
                        <div>
                            <h4>
                                Money Back Guarantee
                            </h4>
                            <p>
                                100% money back
                            </p>
                        </div>
                    </div>

                    <div className="service-box">
                        <FaShieldAlt />
                        <div>
                            <h4>
                                Secure Payment
                            </h4>
                            <p>
                                100% secure payment
                            </p>
                        </div>
                    </div>

                    <div className="service-box">
                        <FaHeadset />
                        <div>
                            <h4>
                                Customer Support 24/7
                            </h4>
                            <p>
                                Dedicated support
                            </p>
                        </div>
                    </div>

                </div>

            </section>


           <About/>
        </div>
    );
};
export default Cart;