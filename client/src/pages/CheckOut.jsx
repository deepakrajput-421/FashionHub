import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-toastify";
import "./css/CheckOut.css";
import Navbar from "../component/navbar";

const Checkout = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [editingAddress, setEditingAddress] = useState(true);
    const [discount, setDiscount] = useState(0);

    const [shippingAddress, setShippingAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

  
    const loadCheckoutData = useCallback(async () => {
        try {
            setLoading(true);

            const cartRes = await axios.get(
                "https://fashionhub-tj47.onrender.com/cart",
                {
                    withCredentials: true
                }
            );

            const cartItems = cartRes.data?.items || [];

            const formattedCart = cartItems
                .filter(item => item && item.productId)
                .map(item => ({
                    ...item.productId,
                    cartItemId: item._id,
                    quantity: Number(item.quantity || 1),
                    size: item.size || null
                }));

            setCart(formattedCart);

            const savedCoupon = sessionStorage.getItem("checkoutCoupon");

            if (savedCoupon) {
                try {
                    const parsedCoupon = JSON.parse(savedCoupon);
                    setDiscount(Number(parsedCoupon.discount || 0));
                } catch (error) {
                    console.log("Invalid saved coupon");
                    sessionStorage.removeItem("checkoutCoupon");
                }
            }

            const savedAddress =
                sessionStorage.getItem("checkoutAddress");

            if (savedAddress) {
                try {
                    const parsedAddress =
                        JSON.parse(savedAddress);

                    setShippingAddress(prev => ({
                        ...prev,
                        ...parsedAddress
                    }));

                    setEditingAddress(false);
                } catch (error) {
                    console.log("Invalid saved address");
                }
            } else {
                try {
                    const addressRes = await axios.get(
                        "https://fashionhub-tj47.onrender.com/address",
                        {
                            withCredentials: true
                        }
                    );

                    const addressData =
                        addressRes.data?.address ||
                        addressRes.data?.AddressData ||
                        addressRes.data;

                    if (
                        addressData &&
                        typeof addressData === "object" &&
                        !Array.isArray(addressData)
                    ) {
                        setShippingAddress(prev => ({
                            ...prev,
                            ...addressData
                        }));

                        setEditingAddress(false);
                    }
                } catch (error) {
                    console.log("Address not found");
                }
            }
        } catch (error) {
            console.log("Checkout loading error:", error);

            if (error.response?.status === 401) {
                toast.error("Login required");
                navigate("/Signup");
                return;
            }

            toast.error("Unable to load checkout");
        } finally {
            setLoading(false);
        }
    }, [navigate]);
      useEffect(() => {
        loadCheckoutData();
    }, [loadCheckoutData]);


    const handleAddressChange = e => {
        const { name, value } = e.target;

        setShippingAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getProductData = item => {
        if (
            item.productId &&
            typeof item.productId === "object"
        ) {
            return item.productId;
        }

        if (
            item.product &&
            typeof item.product === "object"
        ) {
            return item.product;
        }

        return item;
    };

    const getQuantity = item => {
        return Number(
            item.quantity ||
            item.qty ||
            1
        );
    };

    const getPrice = item => {
        const product = getProductData(item);

        return Number(
            product.price ||
            product.Price ||
            item.price ||
            item.Price ||
            0
        );
    };

    const getName = item => {
        const product = getProductData(item);

        return (
            product.ClothName ||
            product.name ||
            product.clothname ||
            "Product"
        );
    };

    const getImage = item => {
        const product = getProductData(item);

        if (!product.image) {
            return "";
        }

        if (
            typeof product.image === "string" &&
            product.image.startsWith("http")
        ) {
            return product.image;
        }

        return `https://fashionhub-tj47.onrender.com/uploads/${product.image}`;
    };

    const subtotal = cart.reduce(
        (total, item) =>
            total +
            getPrice(item) *
            getQuantity(item),
        0
    );

    const shippingCharge =
        subtotal >= 999 ? 0 : 50;

    const totalAmount = Math.max(
        0,
        subtotal +
        shippingCharge -
        discount
    );

    const validateCheckout = () => {
        const {
            name,
            phone,
            address,
            city,
            state,
            pincode
        } = shippingAddress;

        if (!name?.trim()) {
            toast.error("Please enter your name");
            return false;
        }

        if (!phone?.trim()) {
            toast.error("Please enter your phone number");
            return false;
        }

        if (!/^[6-9]\d{9}$/.test(String(phone))) {
            toast.error("Please enter a valid phone number");
            return false;
        }

        if (!address?.trim()) {
            toast.error("Please enter your address");
            return false;
        }

        if (!city?.trim()) {
            toast.error("Please enter your city");
            return false;
        }

        if (!state?.trim()) {
            toast.error("Please enter your state");
            return false;
        }

        if (!/^\d{6}$/.test(String(pincode))) {
            toast.error("Please enter a valid pincode");
            return false;
        }

        if (!cart.length) {
            toast.error("Your cart is empty");
            return false;
        }

        return true;
    };

    const saveAddress = () => {
        if (!validateCheckout()) {
            return;
        }

        sessionStorage.setItem(
            "checkoutAddress",
            JSON.stringify(shippingAddress)
        );

        setEditingAddress(false);

        toast.success("Address saved");
    };

    const placeCODOrder = async () => {
        try {
            const savedCoupon =
                sessionStorage.getItem("checkoutCoupon");

            let couponCode = "";

            if (savedCoupon) {
                try {
                    const parsedCoupon =
                        JSON.parse(savedCoupon);

                    couponCode =
                        parsedCoupon.code || "";
                } catch (error) {
                    console.log(
                        "Invalid saved coupon"
                    );
                }
            }

            const response = await axios.post(
                "https://fashionhub-tj47.onrender.com/create-order",
                {
                    shippingAddress,
                    paymentMethod: "COD",
                    couponCode
                },
                {
                    withCredentials: true
                }
            );

            if (response.data?.success) {
                sessionStorage.removeItem(
                    "checkoutAddress"
                );

                sessionStorage.removeItem(
                    "checkoutCoupon"
                );

                toast.success(
                    "Order placed successfully!"
                );

                navigate("/orders");
            } else {
                toast.error(
                    response.data?.message ||
                    "Unable to place order"
                );
            }
        } catch (error) {
            console.log(
                "COD Order Error:",
                error
            );

            if (error.response?.status === 401) {
                toast.error("Login required");
                navigate("/Signup");
                return;
            }

            toast.error(
                error.response?.data?.message ||
                "Unable to place order"
            );
        }
    };

    const placeOrder = async () => {
        if (!validateCheckout()) {
            return;
        }

        try {
            setPlacingOrder(true);

            await placeCODOrder();
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="checkout-loading">
                    <div className="checkout-spinner"></div>
                    <p>Loading checkout...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="checkout-page">

                <div className="container">

                    <div className="checkout-header">

                        <button
                            className="checkout-back-btn"
                            onClick={() => navigate(-1)}
                        >
                            ← Back to Cart
                        </button>

                        <p className="checkout-small-title">
                            SECURE CHECKOUT
                        </p>

                        <h1>
                            Complete Your Order
                        </h1>

                        <p>
                            Review your details and place your order securely.
                        </p>

                    </div>

                    <div className="row">

                        <div className="col-lg-7">

                            <div className="checkout-card">

                                <div className="section-heading">

                                    <div className="section-number">
                                        01
                                    </div>

                                    <div>
                                        <h3>
                                            Shipping Address
                                        </h3>

                                        <p>
                                            Where should we deliver your order?
                                        </p>
                                    </div>

                                </div>

                                {!editingAddress &&
                                    shippingAddress.name && (
                                        <div className="saved-checkout-address">

                                            <div className="saved-address-title">

                                                <span>
                                                    ✓
                                                </span>

                                                <div>
                                                    <strong>
                                                        Delivery Address
                                                    </strong>

                                                    <small>
                                                        Saved address
                                                    </small>
                                                </div>

                                            </div>

                                            <div className="checkout-address-text">

                                                <strong>
                                                    {shippingAddress.name}
                                                </strong>

                                                <span>
                                                    {shippingAddress.phone}
                                                </span>

                                                <p>
                                                    {shippingAddress.address},{" "}
                                                    {shippingAddress.city},{" "}
                                                    {shippingAddress.state} -{" "}
                                                    {shippingAddress.pincode}
                                                </p>

                                                <button
                                                    className="edit-checkout-address"
                                                    onClick={() =>
                                                        setEditingAddress(true)
                                                    }
                                                >
                                                    Edit Address
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                {editingAddress && (
                                    <div className="checkout-edit-form">

                                        <div className="row">

                                            <div className="col-md-6">

                                                <div className="input-group-custom">

                                                    <label>
                                                        Full Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={
                                                            shippingAddress.name
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Enter your full name"
                                                    />

                                                </div>

                                            </div>

                                            <div className="col-md-6">

                                                <div className="input-group-custom">

                                                    <label>
                                                        Phone Number
                                                    </label>

                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        maxLength="10"
                                                        value={
                                                            shippingAddress.phone
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Enter 10 digit phone number"
                                                    />

                                                </div>

                                            </div>

                                            <div className="col-12">

                                                <div className="input-group-custom">

                                                    <label>
                                                        Address
                                                    </label>

                                                    <textarea
                                                        name="address"
                                                        value={
                                                            shippingAddress.address
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="House no., street, area"
                                                    />

                                                </div>

                                            </div>

                                            <div className="col-md-4">

                                                <div className="input-group-custom">

                                                    <label>
                                                        City
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={
                                                            shippingAddress.city
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="City"
                                                    />

                                                </div>

                                            </div>

                                            <div className="col-md-4">

                                                <div className="input-group-custom">

                                                    <label>
                                                        State
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={
                                                            shippingAddress.state
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="State"
                                                    />

                                                </div>

                                            </div>

                                            <div className="col-md-4">

                                                <div className="input-group-custom">

                                                    <label>
                                                        Pincode
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        maxLength="6"
                                                        value={
                                                            shippingAddress.pincode
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Pincode"
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                        <button
                                            className="place-order-btn"
                                            onClick={saveAddress}
                                        >
                                            Save Address
                                        </button>

                                    </div>
                                )}

                            </div>

                            <div className="checkout-card payment-card">

                                <div className="section-heading">

                                    <div className="section-number">
                                        02
                                    </div>

                                    <div>

                                        <h3>
                                            Payment Method
                                        </h3>

                                        <p>
                                            Choose your preferred payment option.
                                        </p>

                                    </div>

                                </div>

                                <div
                                    className="payment-option active"
                                    onClick={() => {}}
                                >

                                    <div className="payment-radio">

                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={true}
                                            readOnly
                                        />

                                    </div>

                                    <div className="payment-icon">
                                        <FaMoneyBillWave />
                                    </div>

                                    <div className="payment-content">

                                        <h4>
                                            Cash on Delivery
                                        </h4>

                                        <p>
                                            Pay when your order arrives
                                        </p>

                                    </div>

                                    <span className="payment-selected">
                                        Selected
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="col-lg-5">

                            <div className="checkout-card checkout-order-summary">

                                <div className="section-heading summary-heading">

                                    <div className="section-number">
                                        03
                                    </div>

                                    <div>

                                        <h3>
                                            Order Summary
                                        </h3>

                                        <p>
                                            {cart.length} item
                                            {cart.length !== 1
                                                ? "s"
                                                : ""}
                                        </p>

                                    </div>

                                </div>

                                <div className="order-items">

                                    {cart.map(
                                        (item, index) => {

                                            const product =
                                                getProductData(item);

                                            const quantity =
                                                getQuantity(item);

                                            const price =
                                                getPrice(item);

                                            const productName =
                                                getName(item);

                                            const image =
                                                getImage(item);

                                            return (
                                                <div
                                                    className="order-item"
                                                    key={
                                                        item.cartItemId ||
                                                        product._id ||
                                                        index
                                                    }
                                                >

                                                    <div className="checkout-product-image-wrapper">

                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt={
                                                                    productName
                                                                }
                                                                onError={e => {
                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div>
                                                                No Image
                                                            </div>
                                                        )}

                                                        <span className="quantity-badge">
                                                            {quantity}
                                                        </span>

                                                    </div>

                                                    <div className="order-product-info">

                                                        <h4>
                                                            {productName}
                                                        </h4>

                                                        {item.size && (
                                                            <span>
                                                                Size:{" "}
                                                                {item.size}
                                                            </span>
                                                        )}

                                                        <p>
                                                            ₹
                                                            {price.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </p>

                                                    </div>

                                                    <div className="item-total">

                                                        ₹
                                                        {(
                                                            price *
                                                            quantity
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                                <div className="price-details">

                                    <div>

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            ₹
                                            {subtotal.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Shipping
                                        </span>

                                        <strong>
                                            {shippingCharge ===
                                                0
                                                ? "FREE"
                                                : `₹${shippingCharge}`}
                                        </strong>

                                    </div>

                                    {discount > 0 && (
                                        <div>

                                            <span>
                                                Discount
                                            </span>

                                            <strong>
                                                -₹
                                                {discount.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>
                                    )}

                                    {shippingCharge === 0 && (
                                        <div className="free-shipping-text">
                                            🎉 You got FREE shipping
                                        </div>
                                    )}

                                </div>

                                <div className="total-row">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ₹
                                        {totalAmount.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>

                                <button
                                    className="place-order-btn"
                                    onClick={placeOrder}
                                    disabled={
                                        placingOrder
                                    }
                                >

                                    {placingOrder ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order

                                            <span>
                                                →
                                            </span>
                                        </>
                                    )}

                                </button>

                                <div className="checkout-secure-checkout">

                                    <span>
                                        🔒
                                    </span>

                                    <p>
                                        Secure & Safe Checkout
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
};

export default Checkout;