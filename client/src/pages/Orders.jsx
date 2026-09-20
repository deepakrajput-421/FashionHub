import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaShoppingBag } from "react-icons/fa";
import "./css/Orders.css";
import Navbar from "../component/navbar";
const Orders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

  
    const getOrders = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://fashionhub-tj47.onrender.com/orders",
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setOrders(response.data.orders || []);
            }

        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/Login");
                return;
            }

            toast.error(
                error.response?.data?.message ||
                "Unable to load orders"
            );

        } finally {
            setLoading(false);
        }
    }, [navigate]);
  useEffect(() => {
        getOrders();
    }, [getOrders]);

    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // fallback for older orders created before expectedDeliveryDate existed on the schema
    const getExpectedDelivery = (order) => {
        if (order.expectedDeliveryDate) {
            return order.expectedDeliveryDate;
        }

        if (order.createdAt) {
            const fallback = new Date(order.createdAt);
            fallback.setDate(fallback.getDate() + 5);
            return fallback;
        }

        return null;
    };

    const getStatusStep = (status) => {

        const currentStatus =
            String(status || "confirmed").toLowerCase();

        if (currentStatus === "cancelled") {
            return -1;
        }

        if (currentStatus === "pending") {
            return 0;
        }

        if (currentStatus === "confirmed") {
            return 0;
        }

        if (currentStatus === "processing") {
            return 1;
        }

        if (currentStatus === "shipped") {
            return 2;
        }

        if (currentStatus === "delivered") {
            return 3;
        }

        return 0;
    };

    const getStatusText = (status) => {

        const currentStatus =
            String(status || "confirmed").toLowerCase();

        if (currentStatus === "pending") {
            return "Order Placed";
        }

        if (currentStatus === "confirmed") {
            return "Order Confirmed";
        }

        if (currentStatus === "processing") {
            return "Processing";
        }

        if (currentStatus === "shipped") {
            return "Shipped";
        }

        if (currentStatus === "delivered") {
            return "Delivered";
        }

        if (currentStatus === "cancelled") {
            return "Order Cancelled";
        }

        return status;
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <div className="orders-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-user-page">

            <Navbar />

            <div className="container">

                <div className="orders-user-header">

                    <p className="orders-brand">
                        FASHIONHUB
                    </p>

                    <h1>My Orders</h1>

                    <p>
                        Track your orders and view complete order details
                    </p>

                </div>

                {orders.length === 0 ? (

                    <div className="empty-orders">

                        <div className="empty-orders-icon">
                            🛍️
                        </div>

                        <h2>No Orders Yet</h2>

                        <p>
                            You haven't placed any orders yet.
                            Start shopping and your orders will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/shop")}
                        >
                            Start Shopping →
                        </button>

                    </div>

                ) : (

                    <div className="orders-list">

                        {orders.map((order) => {

                            const currentStep =
                                getStatusStep(order.orderStatus);

                            const isCancelled =
                                String(order.orderStatus).toLowerCase() ===
                                "cancelled";

                            const isDelivered =
                                String(order.orderStatus).toLowerCase() ===
                                "delivered";

                            const expectedDelivery =
                                getExpectedDelivery(order);

                            return (

                                <div
                                    className="order-card"
                                    key={order._id}
                                >

                                    {/* ORDER HEADER */}

                                    <div className="order-header">

                                        <div className="order-id-box">

                                            <span>
                                                ORDER ID
                                            </span>

                                            <strong>
                                                #{order._id
                                                    .slice(-10)
                                                    .toUpperCase()}
                                            </strong>

                                        </div>

                                        <div className="order-created">

                                            <span>
                                                ORDERED ON
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    order.createdAt
                                                )}
                                            </strong>

                                        </div>

                                        <div
                                            className={`order-status-badge ${
                                                isCancelled
                                                    ? "cancelled"
                                                    : ""
                                            }`}
                                        >
                                            {getStatusText(
                                                order.orderStatus
                                            )}
                                        </div>

                                    </div>


                                    {/* EXPECTED DELIVERY */}

                                    {!isCancelled && (

                                        <div className="delivery-banner">
                                            <div className="delivery-left">
                                                <div className="delivery-icon">
                                                    🚚
                                                </div>
                                                <div>
                                                    <span>
                                                        {isDelivered
                                                            ? "DELIVERED ON"
                                                            : "EXPECTED DELIVERY"}
                                                    </span>
                                                    <strong>
                                                        {isDelivered
                                                            ? formatDate(order.updatedAt)
                                                            : formatDate(expectedDelivery)}
                                                    </strong>
                                                </div>
                                            </div>
                                            <div className="delivery-status-text">
                                                {isDelivered
                                                    ? "Delivered successfully"
                                                    : "Your order is on the way"}
                                            </div>
                                        </div>
                                    )}
                                    {isCancelled && (
                                        <div className="delivery-banner">
                                            <div className="delivery-left">
                                                <div className="delivery-icon">
                                                    ❌
                                                </div>
                                                <div>
                                                    <span>
                                                        STATUS
                                                    </span>

                                                    <strong>
                                                        Order Cancelled
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>

                                    )}


                                    {/* ORDER TRACKING LINE */}

                                    {!isCancelled && (

                                        <div className="tracking-section">

                                            <div className="tracking-title">

                                                <strong>
                                                    Order Tracking
                                                </strong>

                                                <span>
                                                    {getStatusText(
                                                        order.orderStatus
                                                    )}
                                                </span>

                                            </div>

                                            <div className="tracking-line">

                                                <div
                                                    className={`tracking-progress progress-${currentStep}`}
                                                ></div>

                                                <div className="tracking-step">

                                                    <div
                                                        className={
                                                            currentStep >= 0
                                                                ? "tracking-dot active"
                                                                : "tracking-dot"
                                                        }
                                                    >
                                                        {currentStep > 0
                                                            ? "✓"
                                                            : "1"}
                                                    </div>

                                                    <span>
                                                        Order Placed
                                                    </span>

                                                </div>

                                                <div className="tracking-connector"></div>

                                                <div className="tracking-step">

                                                    <div
                                                        className={
                                                            currentStep >= 1
                                                                ? "tracking-dot active"
                                                                : "tracking-dot"
                                                        }
                                                    >
                                                        {currentStep > 1
                                                            ? "✓"
                                                            : "2"}
                                                    </div>

                                                    <span>
                                                        Processing
                                                    </span>

                                                </div>

                                                <div className="tracking-connector"></div>

                                                <div className="tracking-step">

                                                    <div
                                                        className={
                                                            currentStep >= 2
                                                                ? "tracking-dot active"
                                                                : "tracking-dot"
                                                        }
                                                    >
                                                        {currentStep > 2
                                                            ? "✓"
                                                            : "3"}
                                                    </div>

                                                    <span>
                                                        Shipped / In Transit
                                                    </span>

                                                </div>

                                                <div className="tracking-connector"></div>

                                                <div className="tracking-step">

                                                    <div
                                                        className={
                                                            currentStep >= 3
                                                                ? "tracking-dot active"
                                                                : "tracking-dot"
                                                        }
                                                    >
                                                        {currentStep >= 3
                                                            ? "✓"
                                                            : "4"}
                                                    </div>

                                                    <span>
                                                        Delivered
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    )}


                                    {/* PRODUCTS */}

                                    <div className="order-content">

                                        <div className="products-section">

                                            <div className="section-title">
                                                <h3>
                                                    Order Items
                                                </h3>

                                                <span>
                                                    {order.items.length}{" "}
                                                    {order.items.length === 1
                                                        ? "Item"
                                                        : "Items"}
                                                </span>
                                            </div>

                                            <div className="ordered-products">

                                                {order.items.map(
                                                    (item, index) => (

                                                        <div
                                                            className="ordered-product"
                                                            key={
                                                                item._id ||
                                                                index
                                                            }
                                                        >

                                                            <div className="orders-product-image">

                                                                {item.image ? (
                                                                    <img
                                                                        src={`https://fashionhub-tj47.onrender.com/uploads/${item.image}`}
                                                                        alt={item.productName || "Product"}
                                                                    />
                                                                ) : (
                                                                    <div className="product-image-fallback">
                                                                        <FaShoppingBag />
                                                                    </div>
                                                                )}

                                                                <span>
                                                                    ×
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>

                                                            </div>

                                                            <div className="orders-product-info">

                                                                <h4>
                                                                    {
                                                                        item.productName
                                                                    }
                                                                </h4>

                                                                <div className="product-meta">

                                                                    {item.size && (
                                                                        <span>
                                                                            Size:{" "}
                                                                            <strong>
                                                                                {
                                                                                    item.size
                                                                                }
                                                                            </strong>
                                                                        </span>
                                                                    )}

                                                                    <span>
                                                                        Qty:{" "}
                                                                        <strong>
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </strong>
                                                                    </span>

                                                                </div>

                                                                <p className="product-unit-price">
                                                                    ₹
                                                                    {Number(item.price || 0).toLocaleString("en-IN")}{" "}
                                                                    each
                                                                </p>

                                                            </div>

                                                            <div className="product-total">

                                                                <span>
                                                                    Total
                                                                </span>

                                                                <strong>
                                                                    ₹
                                                                    {(
                                                                        Number(item.price || 0) *
                                                                        Number(item.quantity || 0)
                                                                    ).toLocaleString("en-IN")}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        </div>


                                        {/* PRICE DETAILS */}

                                        <div className="price-section">

                                            <div className="section-title">
                                                <h3>
                                                    Price Details
                                                </h3>
                                            </div>

                                            <div className="orders-price-row">

                                                <span >
                                                    Subtotal :
                                                </span>

                                                <strong>
                                                    ₹{Number(
                                                        order.items?.reduce(
                                                            (total, item) =>
                                                                total +
                                                                Number(item.price || 0) *
                                                                Number(item.quantity || 0),
                                                            0
                                                        )
                                                    ).toLocaleString("en-IN")}
                                                </strong>

                                            </div>

                                            {order.discount > 0 && (

                                                <div className="orders-price-row discount">

                                                    <span>
                                                        Discount
                                                    </span>

                                                    <strong>
                                                        -₹{Number(order.discount).toLocaleString("en-IN")}
                                                    </strong>

                                                </div>

                                            )}

                                            <div className="orders-price-row">

                                                <span>
                                                    Shipping :
                                                </span>

                                                <strong>
                                                    {order.shippingCharge === 0
                                                        ? "FREE"
                                                        : `₹${order.shippingCharge}`}
                                                </strong>

                                            </div>

                                            <div className="price-total">

                                                <span>
                                                    Total Amount
                                                </span>

                                                <strong>
                                                    ₹{Math.max(
                                                        0,
                                                        order.items?.reduce(
                                                            (total, item) =>
                                                                total +
                                                                Number(item.price || 0) *
                                                                Number(item.quantity || 0),
                                                            0
                                                        ) -
                                                        Number(order.discount || 0) +
                                                        Number(order.shippingCharge || 0)
                                                    ).toLocaleString("en-IN")}
                                                </strong>

                                            </div>

                                            <div className="payment-box">

                                                <span>
                                                    Payment Method
                                                </span>

                                                <strong>
                                                    {order.paymentMethod ===
                                                    "COD"
                                                        ? "Cash on Delivery"
                                                        : "Online Payment"}
                                                </strong>

                                            </div>

                                            <div className="payment-status">

                                                <span>
                                                    Payment Status
                                                </span>

                                                <strong
                                                    className={
                                                        order.paymentStatus ===
                                                        "paid"
                                                            ? "paid"
                                                            : ""
                                                    }
                                                >
                                                    {order.paymentStatus}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* DELIVERY ADDRESS */}

                                    <div className="address-section">

                                        <div className="address-heading">

                                            <div className="address-heading-left">

                                                <div className="address-icon">
                                                    📍
                                                </div>

                                                <div>

                                                    <h3>
                                                        Delivery Address
                                                    </h3>

                                                    <span>
                                                        Order will be delivered
                                                        to this address
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="phone-number">

                                                📞{" "}
                                                {
                                                    order.shippingAddress?.phone || "N/A"
                                                }

                                            </div>

                                        </div>

                                        <div className="address-details">

                                            <strong>
                                                {
                                                    order.shippingAddress?.name
                                                }
                                            </strong>

                                            <p>
                                                {
                                                    order.shippingAddress?.address
                                                }
                                            </p>

                                            <p>
                                                {
                                                    order.shippingAddress?.city
                                                }
                                                {order.shippingAddress?.city && ", "}
                                                {
                                                    order.shippingAddress?.state
                                                }{" "}
                                                -{" "}
                                                {
                                                    order.shippingAddress?.pincode
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* FOOTER */}

                                    <div className="order-footer">

                                        <div>

                                            <span>
                                                Need anything else?
                                            </span>

                                            <strong>
                                                Continue shopping for more
                                                products
                                            </strong>

                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate("/shop")
                                            }
                                        >
                                            Continue Shopping →
                                        </button>

                                    </div>

                                </div>

                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
};

export default Orders;