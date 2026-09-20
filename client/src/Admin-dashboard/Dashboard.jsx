
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBoxOpen, FaShoppingBag, FaRupeeSign, FaEnvelope, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SideBar } from "./SideBar";
import "./dashboard.css";

export const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getDashboardData = async () => {
        try {
            const [productResult, orderResult, contactResult] = await Promise.all([
                axios.get("http://localhost:4000/GetData"),
                axios.get("http://localhost:4000/admin/orders", {
                    withCredentials: true
                }),
                axios.get("http://localhost:4000/getcontact")
            ]);

            setProducts(productResult.data?.ClothData || []);

            const orderData = orderResult.data;
            if (Array.isArray(orderData)) {
                setOrders(orderData);
            } else if (Array.isArray(orderData?.orders)) {
                setOrders(orderData.orders);
            } else if (Array.isArray(orderData?.OrderData)) {
                setOrders(orderData.OrderData);
            } else {
                setOrders([]);
            }

            setContacts(Array.isArray(contactResult.data) ? contactResult.data : []);

        } catch (error) {
            console.log("Dashboard Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    const getOrderTotal = (order) => {
        if (order.totalAmount) {
            return Number(order.totalAmount) || 0;
        }

        if (order.total) {
            return Number(order.total) || 0;
        }

        if (Array.isArray(order.items)) {
            return order.items.reduce((total, item) => {
                return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
            }, 0);
        }

        return 0;
    };

    const totalSales = orders.reduce((total, order) => {
        return total + getOrderTotal(order);
    }, 0);

    const lowStockProducts = products.filter((product) => {
        if (!Array.isArray(product.sizes)) {
            return false;
        }

        const totalStock = product.sizes.reduce((total, size) => {
            return total + (Number(size.stock) || 0);
        }, 0);

        return totalStock > 0 && totalStock <= 5;
    });

    const getProductStock = (product) => {
        if (!Array.isArray(product.sizes)) {
            return 0;
        }

        return product.sizes.reduce((total, size) => {
            return total + (Number(size.stock) || 0);
        }, 0);
    };

    const recentOrders = [...orders]
        .sort((a, b) => {
            return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
        })
        .slice(0, 5);

    const recentContacts = [...contacts]
        .sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, 4);

    const getOrderStatus = (order) => {
        return order.status || order.orderStatus || "Pending";
    };

    const getStatusClass = (status) => {
        const value = status.toLowerCase();

        if (value.includes("deliver")) {
            return "fh-dashboard-status delivered";
        }

        if (value.includes("cancel")) {
            return "fh-dashboard-status cancelled";
        }

        if (value.includes("ship")) {
            return "fh-dashboard-status shipped";
        }

        if (value.includes("process")) {
            return "fh-dashboard-status processing";
        }

        return "fh-dashboard-status pending";
    };

    return (
        <div className="fh-dashboard-page">

            <SideBar />

            <main className="fh-dashboard-main">

                <header className="fh-dashboard-topbar">

                    <div className="fh-dashboard-top-left">
                        <h1>Dashboard</h1>
                        <p>Welcome back, Deepak. Here's what's happening today.</p>
                    </div>

                    <div className="fh-dashboard-admin-profile">
                        <div className="fh-dashboard-admin-avatar">
                            A
                        </div>

                        <div>
                            <strong>Admin User</strong>
                            <span>Deepak singh Rajput</span>
                        </div>
                    </div>

                </header>

                <section className="fh-dashboard-content">

                    <div className="fh-dashboard-welcome-card">

                        <div>
                            <span className="fh-dashboard-welcome-label">
                                FASHIONHUB ADMIN
                            </span>

                            <h2>Manage your store with ease.</h2>

                            <p>
                                Keep track of products, orders and customer requests
                                from one place.
                            </p>

                            <Link to="/manage-data" className="fh-dashboard-welcome-btn">
                                Manage Products
                                <FaArrowRight />
                            </Link>
                        </div>

                        <div className="fh-dashboard-welcome-shape">
                            FH
                        </div>

                    </div>


                    <div className="fh-dashboard-stats-grid">

                        <div className="fh-dashboard-stat-card">

                            <div className="fh-dashboard-stat-icon products-icon">
                                <FaBoxOpen />
                            </div>

                            <div className="fh-dashboard-stat-info">
                                <span>Total Products</span>
                                <h3>{loading ? "—" : products.length}</h3>
                                <small>Products in store</small>
                            </div>

                        </div>


                        <div className="fh-dashboard-stat-card">

                            <div className="fh-dashboard-stat-icon orders-icon">
                                <FaShoppingBag />
                            </div>

                            <div className="fh-dashboard-stat-info">
                                <span>Total Orders</span>
                                <h3>{loading ? "—" : orders.length}</h3>
                                <small>Orders received</small>
                            </div>

                        </div>


                        <div className="fh-dashboard-stat-card">

                            <div className="fh-dashboard-stat-icon sales-icon">
                                <FaRupeeSign />
                            </div>

                            <div className="fh-dashboard-stat-info">
                                <span>Total Sales</span>
                                <h3>
                                    {loading
                                        ? "—"
                                        : `₹${totalSales.toLocaleString("en-IN")}`}
                                </h3>
                                <small>Order value</small>
                            </div>

                        </div>


                        <div className="fh-dashboard-stat-card">

                            <div className="fh-dashboard-stat-icon contact-icon">
                                <FaEnvelope />
                            </div>

                            <div className="fh-dashboard-stat-info">
                                <span>Contact Requests</span>
                                <h3>{loading ? "—" : contacts.length}</h3>
                                <small>Customer messages</small>
                            </div>

                        </div>

                    </div>


                    <div className="fh-dashboard-main-grid">

                        <div className="fh-dashboard-panel fh-dashboard-orders-panel">

                            <div className="fh-dashboard-panel-header">

                                <div>
                                    <h3>Recent Orders</h3>
                                    <p>Latest orders from your customers</p>
                                </div>

                                <Link to="/order-status">
                                    View All
                                    <FaArrowRight />
                                </Link>

                            </div>


                            {recentOrders.length > 0 ? (

                                <div className="fh-dashboard-orders-list">

                                    {recentOrders.map((order, index) => {

                                        const status = getOrderStatus(order);

                                        return (
                                            <div
                                                className="fh-dashboard-order-row"
                                                key={order._id || index}
                                            >

                                                <div className="fh-dashboard-order-number">
                                                    <div className="fh-dashboard-order-icon">
                                                        <FaShoppingBag />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            #{String(order._id || "ORDER").slice(-8).toUpperCase()}
                                                        </strong>

                                                        <span>
                                                            {order.userEmail || order.email || "Customer"}
                                                        </span>
                                                    </div>
                                                </div>


                                                <div className="fh-dashboard-order-date">
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleDateString("en-IN")
                                                        : "—"}
                                                </div>


                                                <div className={getStatusClass(status)}>
                                                    {status}
                                                </div>


                                                <strong className="fh-dashboard-order-price">
                                                    ₹{getOrderTotal(order).toLocaleString("en-IN")}
                                                </strong>

                                            </div>
                                        );
                                    })}

                                </div>

                            ) : (

                                <div className="fh-dashboard-empty">
                                    <FaShoppingBag />
                                    <p>No orders found</p>
                                </div>

                            )}

                        </div>


                        <div className="fh-dashboard-panel fh-dashboard-stock-panel">

                            <div className="fh-dashboard-panel-header">

                                <div>
                                    <h3>Low Stock</h3>
                                    <p>Products that need attention</p>
                                </div>

                                <FaExclamationTriangle className="fh-dashboard-warning-icon" />

                            </div>


                            {lowStockProducts.length > 0 ? (

                                <div className="fh-dashboard-stock-list">

                                    {lowStockProducts.slice(0, 5).map((product) => (

                                        <div
                                            className="fh-dashboard-stock-item"
                                            key={product._id}
                                        >

                                            <div className="fh-dashboard-stock-image">

                                                <img
                                                    src={`http://localhost:4000/uploads/${product.image}`}
                                                    alt={product.ClothName}
                                                />

                                            </div>

                                            <div className="fh-dashboard-stock-info">

                                                <strong>{product.ClothName}</strong>

                                                <span>{product.category}</span>

                                            </div>

                                            <div className="fh-dashboard-stock-count">
                                                {getProductStock(product)}
                                                <small>left</small>
                                            </div>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="fh-dashboard-empty">
                                    <FaBoxOpen />
                                    <p>All products have healthy stock</p>
                                </div>

                            )}

                        </div>

                    </div>


                    <div className="fh-dashboard-bottom-grid">

                        <div className="fh-dashboard-panel fh-dashboard-contact-panel">

                            <div className="fh-dashboard-panel-header">

                                <div>
                                    <h3>Customer Messages</h3>
                                    <p>Latest contact requests</p>
                                </div>

                                <Link to="/contact-messages">
                                    View All
                                    <FaArrowRight />
                                </Link>

                            </div>


                            {recentContacts.length > 0 ? (

                                <div className="fh-dashboard-contact-list">

                                    {recentContacts.map((contact, index) => (

                                        <div
                                            className="fh-dashboard-contact-item"
                                            key={contact._id || index}
                                        >

                                            <div className="fh-dashboard-contact-avatar">
                                                {contact.name
                                                    ? contact.name.charAt(0).toUpperCase()
                                                    : "U"}
                                            </div>

                                            <div className="fh-dashboard-contact-info">

                                                <strong>{contact.name}</strong>

                                                <span>{contact.email}</span>

                                                <p>{contact.subject}</p>

                                            </div>

                                            <small>
                                                {contact.createdAt
                                                    ? new Date(contact.createdAt).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </small>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="fh-dashboard-empty">
                                    <FaEnvelope />
                                    <p>No customer messages</p>
                                </div>

                            )}

                        </div>


                        <div className="fh-dashboard-panel fh-dashboard-store-panel">

                            <div className="fh-dashboard-store-heading">
                                <span>STORE OVERVIEW</span>
                                <h3>Your FashionHub</h3>
                                <p>
                                    Keep your products, orders and customer
                                    communication organized.
                                </p>
                            </div>


                            <div className="fh-dashboard-store-items">

                                <Link to="/manage-data">
                                    <div>
                                        <FaBoxOpen />
                                    </div>
                                    <span>Manage Products</span>
                                    <FaArrowRight />
                                </Link>

                                <Link to="/order-status">
                                    <div>
                                        <FaShoppingBag />
                                    </div>
                                    <span>Manage Orders</span>
                                    <FaArrowRight />
                                </Link>

                                <Link to="/users">
                                    <div>
                                        <FaEnvelope />
                                    </div>
                                    <span>Customer Messages</span>
                                    <FaArrowRight />
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>


                <footer className="fh-dashboard-footer">
                    © 2026 FashionHub. All rights reserved.
                </footer>

            </main>

        </div>
    );
};

export default Dashboard;

