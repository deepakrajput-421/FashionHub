
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaSearch,
    FaEye,
    FaBox,
    FaTruck,
    FaCheckCircle
} from "react-icons/fa";
import "./OrderStatus.css";

const OrderStatus = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                "http://localhost:4000/admin/orders",
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setOrders(response.data.orders || []);
            }
        } catch (error) {
            console.log("Get Admin Orders Error:", error);

            if (error.response?.status === 401) {
                window.location.href = "/Login";
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatDate = date => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getOrderId = order => {
        if (!order?._id) return "-";

        return `FH${order._id.slice(-6).toUpperCase()}`;
    };

    const getStatusLabel = status => {
        switch (status) {
            case "pending":
                return "Pending";

            case "confirmed":
                return "Confirmed";

            case "processing":
                return "Processing";

            case "shipped":
                return "Shipped";

            case "delivered":
                return "Delivered";

            case "cancelled":
                return "Cancelled";

            default:
                return status || "-";
        }
    };

    const getStatusClass = status => {
        switch (status) {
            case "pending":
                return "status pending";

            case "confirmed":
                return "status confirmed";

            case "processing":
                return "status transit";

            case "shipped":
                return "status shipped";

            case "delivered":
                return "status delivered";

            case "cancelled":
                return "status cancelled";

            default:
                return "status";
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.patch(
                `http://localhost:4000/updateOrderStatus/${orderId}`,
                {
                    orderStatus: newStatus
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setOrders(prev =>
                    prev.map(order =>
                        order._id === orderId
                            ? response.data.order
                            : order
                    )
                );

                if (selectedOrder?._id === orderId) {
                    setSelectedOrder(response.data.order);
                }
            }
        } catch (error) {
            console.log("Update Order Status Error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to update order status"
            );
        }
    };

    const filteredOrders = orders.filter(order => {
        const orderId = getOrderId(order).toLowerCase();

        const customer =
            order.shippingAddress?.name?.toLowerCase() || "";

        const email =
            order.userEmail?.toLowerCase() || "";

        const searchValue = search.toLowerCase();

        const searchMatch =
            orderId.includes(searchValue) ||
            customer.includes(searchValue) ||
            email.includes(searchValue);

        const statusMatch =
            filterStatus === "All" ||
            order.orderStatus === filterStatus;

        return searchMatch && statusMatch;
    });

    /*
        DATE WISE GROUPING
        Same date ke orders ek group me aayenge.
        Newest date sabse upar rahegi.
    */
    const groupedOrders = filteredOrders.reduce((groups, order) => {
        const dateKey = order.createdAt
            ? new Date(order.createdAt).toISOString().split("T")[0]
            : "unknown";

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push(order);

        return groups;
    }, {});

    const sortedDateGroups = Object.entries(groupedOrders).sort(
        ([dateA], [dateB]) => {
            if (dateA === "unknown") return 1;
            if (dateB === "unknown") return -1;

            return new Date(dateB) - new Date(dateA);
        }
    );

    const formatGroupDate = date => {
        if (date === "unknown") {
            return "Unknown Date";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    const inTransitCount = orders.filter(
        order =>
            order.orderStatus === "processing" ||
            order.orderStatus === "shipped"
    ).length;

    const deliveredCount = orders.filter(
        order => order.orderStatus === "delivered"
    ).length;

    return (
        <div className="admin-orders-page">

            {/* HEADER */}

            <div className="admin-orders-header">

                <div>
                    <h2>Orders</h2>
                    <p>Manage and track customer orders</p>
                </div>

                <div className="admin-order-summary">

                    <div className="summary-card">
                        <FaBox />

                        <div>
                            <span>Total Orders</span>
                            <strong>{orders.length}</strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <FaTruck />

                        <div>
                            <span>In Transit</span>
                            <strong>{inTransitCount}</strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <FaCheckCircle />

                        <div>
                            <span>Delivered</span>
                            <strong>{deliveredCount}</strong>
                        </div>
                    </div>

                </div>

            </div>

            {/* TOOLBAR */}

            <div className="orders-toolbar">

                <div className="order-search">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search order, customer or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                </div>

                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="All">
                        All Status
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="confirmed">
                        Confirmed
                    </option>

                    <option value="processing">
                        Processing
                    </option>

                    <option value="shipped">
                        Shipped / In Transit
                    </option>

                    <option value="delivered">
                        Delivered
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>

            </div>

            {/* TABLE */}

            <div className="orders-table-container">

                <table className="orders-table">

                    <thead>

                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan="7"
                                    className="no-orders"
                                >
                                    Loading orders...
                                </td>
                            </tr>

                        ) : filteredOrders.length > 0 ? (

                            sortedDateGroups.map(([date, dateOrders]) => (

                                <React.Fragment key={date}>

                                    {/* DATE GROUP */}

                                    <tr className="order-date-group-row">

                                        <td colSpan="7">

                                            <div className="order-date-group">

                                                <strong>
                                                    {formatGroupDate(date)}
                                                </strong>

                                                <span>
                                                    {dateOrders.length}{" "}
                                                    {dateOrders.length === 1
                                                        ? "Order"
                                                        : "Orders"}
                                                </span>

                                            </div>

                                        </td>

                                    </tr>

                                    {/* ORDERS OF THIS DATE */}

                                    {dateOrders.map(order => (

                                        <tr key={order._id}>

                                            {/* ORDER ID */}

                                            <td>
                                                <strong>
                                                    #{getOrderId(order)}
                                                </strong>
                                            </td>

                                            {/* CUSTOMER */}

                                            <td>

                                                <div className="customer">

                                                    <div className="customer-avatar">

                                                        {(
                                                            order.shippingAddress?.name ||
                                                            order.userEmail ||
                                                            "U"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {order.shippingAddress?.name ||
                                                                "Customer"}
                                                        </strong>

                                                        <span>
                                                            {order.userEmail}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* ITEMS */}

                                            <td>
                                                {order.items?.length || 0} Items
                                            </td>

                                            {/* AMOUNT */}

                                            <td>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.totalAmount || 0
                                                    ).toLocaleString("en-IN")}
                                                </strong>

                                            </td>

                                            {/* DATE */}

                                            <td>
                                                {formatDate(order.createdAt)}
                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <select
                                                    className={getStatusClass(
                                                        order.orderStatus
                                                    )}
                                                    value={order.orderStatus}
                                                    disabled={
                                                        order.orderStatus ===
                                                        "cancelled"
                                                    }
                                                    onChange={e =>
                                                        updateStatus(
                                                            order._id,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="pending">
                                                        Pending
                                                    </option>

                                                    <option value="confirmed">
                                                        Confirmed
                                                    </option>

                                                    <option value="processing">
                                                        Processing
                                                    </option>

                                                    <option value="shipped">
                                                        Shipped
                                                    </option>

                                                    <option value="delivered">
                                                        Delivered
                                                    </option>

                                                    <option
                                                        value="cancelled"
                                                        disabled={
                                                            order.orderStatus ===
                                                            "shipped" ||
                                                            order.orderStatus ===
                                                            "delivered"
                                                        }
                                                    >
                                                        Cancelled
                                                    </option>

                                                </select>

                                            </td>

                                            {/* VIEW */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-order"
                                                    onClick={() =>
                                                        setSelectedOrder(order)
                                                    }
                                                >
                                                    <FaEye />
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </React.Fragment>

                            ))

                        ) : (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="no-orders"
                                >
                                    No orders found
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

            {/* VIEW ORDER MODAL */}

            {selectedOrder && (

                <div
                    className="order-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="order-modal"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="order-modal-header">

                            <div>

                                <h3>
                                    Order Details
                                </h3>

                                <span>
                                    #{getOrderId(selectedOrder)}
                                </span>

                            </div>

                            <button
                                type="button"
                                className="order-modal-close"
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <div className="order-modal-body">

                            {/* CUSTOMER */}

                            <div className="order-detail-section">

                                <h4>
                                    Customer Details
                                </h4>

                                <p>
                                    <strong>
                                        Name:
                                    </strong>{" "}
                                    {selectedOrder.shippingAddress?.name ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Email:
                                    </strong>{" "}
                                    {selectedOrder.userEmail ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Phone:
                                    </strong>{" "}
                                    {selectedOrder.shippingAddress?.phone ||
                                        "N/A"}
                                </p>

                            </div>

                            {/* SHIPPING ADDRESS */}

                            <div className="order-detail-section">

                                <h4>
                                    Shipping Address
                                </h4>

                                <p>
                                    {selectedOrder.shippingAddress?.address ||
                                        "N/A"}
                                </p>

                                <p>
                                    {selectedOrder.shippingAddress?.city ||
                                        "N/A"}
                                    {", "}
                                    {selectedOrder.shippingAddress?.state ||
                                        "N/A"}
                                    {" - "}
                                    {selectedOrder.shippingAddress?.pincode ||
                                        "N/A"}
                                </p>

                            </div>

                            {/* PRODUCTS */}

                            <div className="order-detail-section">

                                <h4>
                                    Products
                                </h4>

                                {selectedOrder.items?.length > 0 ? (

                                    selectedOrder.items.map(
                                        (item, index) => (

                                            <div
                                                className="order-product"
                                                key={
                                                    item._id ||
                                                    index
                                                }
                                            >

                                                <img
                                                    src={`http://localhost:4000/uploads/${item.image}`}
                                                    alt={
                                                        item.productName ||
                                                        "Product"
                                                    }
                                                    onError={e => {
                                                        e.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />

                                                <div>

                                                    <strong>
                                                        {item.productName ||
                                                            "Product"}
                                                    </strong>

                                                    <p>
                                                        Size:{" "}
                                                        {item.size ||
                                                            "N/A"}
                                                    </p>

                                                    <p>
                                                        Quantity:{" "}
                                                        {item.quantity ||
                                                            0}
                                                    </p>

                                                    <p>
                                                        Price: ₹
                                                        {Number(
                                                            item.price ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                </div>

                                            </div>

                                        )
                                    )

                                ) : (

                                    <p>
                                        No products found
                                    </p>

                                )}

                            </div>

                            {/* PAYMENT & ORDER */}

                            <div className="order-detail-section">

                                <h4>
                                    Payment & Order
                                </h4>

                                <p>
                                    <strong>
                                        Payment:
                                    </strong>{" "}
                                    {selectedOrder.paymentMethod ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Payment Status:
                                    </strong>{" "}
                                    {selectedOrder.paymentStatus ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Order Status:
                                    </strong>{" "}
                                    {getStatusLabel(
                                        selectedOrder.orderStatus
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Order Date:
                                    </strong>{" "}
                                    {formatDate(
                                        selectedOrder.createdAt
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Expected Delivery:
                                    </strong>{" "}
                                    {formatDate(
                                        selectedOrder.expectedDeliveryDate
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Subtotal:
                                    </strong>{" "}
                                    ₹
                                    {Number(
                                        selectedOrder.subtotal || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Discount:
                                    </strong>{" "}
                                    ₹
                                    {Number(
                                        selectedOrder.discount || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Shipping:
                                    </strong>{" "}
                                    ₹
                                    {Number(
                                        selectedOrder.shippingCharge || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </p>

                                <p className="order-total">

                                    <strong>
                                        Total:
                                    </strong>{" "}

                                    ₹
                                    {Number(
                                        selectedOrder.totalAmount || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default OrderStatus;

