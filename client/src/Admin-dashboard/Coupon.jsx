
import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "./SideBar";
import "./Coupon.css";
import { toast } from "react-toastify";

const Coupon = () => {
    const [coupon, setCoupon] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: "",
        maxDiscount: "",
        expiryDate: "",
        usageLimit: "",
        userType: "all"
    });

    const [couponData, setCouponData] = useState([]);

    const inputHandler = (e) => {
        setCoupon({
            ...coupon,
            [e.target.name]: e.target.value
        });
    };

    const getCoupons = async () => {
        try {
            const res = await axios.get(
                "https://fashionhub-tj47.onrender.com/getcoupons",
                {
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setCouponData(res.data.couponData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCoupons();
    }, []);

    const addCoupon = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "https://fashionhub-tj47.onrender.com/addcoupon",
                coupon,
                {
                    withCredentials: true
                }
            );

            console.log(res.data);

            if (res.data.success) {
                setCoupon({
                    code: "",
                    discountType: "percentage",
                    discountValue: "",
                    minOrderAmount: "",
                    maxDiscount: "",
                    expiryDate: "",
                    usageLimit: "",
                    userType: "all"
                });

                getCoupons();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const deleteCoupon = async (id) => {
        try {
            const res = await axios.delete(
                `https://fashionhub-tj47.onrender.com/deletecoupon/${id}`,
                {
                    withCredentials: true
                }
            )
            if (res.data.success) {
                getCoupons();
                toast.success("Coupon deleted successfully");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="coupon-page">
            <SideBar />

            <div className="coupon-content">
                <h2>Add Coupon</h2>

                <p className="coupon-note">
                    Create attractive offers and give your customers a reason to shop more.
                </p>

                <div className="coupon-form-box">
                    <form onSubmit={addCoupon}>
                        <div className="coupon-row">
                            <div className="coupon-field">
                                <label>Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="FASHION10"
                                    value={coupon.code}
                                    onChange={inputHandler}
                                    required
                                />
                            </div>

                            <div className="coupon-field">
                                <label>Discount Type</label>
                                <select
                                    name="discountType"
                                    value={coupon.discountType}
                                    onChange={inputHandler}
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="flat">Flat Amount</option>
                                </select>
                            </div>
                        </div>

                        <div className="coupon-row">
                            <div className="coupon-field">
                                <label>Discount Value</label>
                                <input
                                    type="number"
                                    name="discountValue"
                                    placeholder="10"
                                    value={coupon.discountValue}
                                    onChange={inputHandler}
                                    required
                                />
                            </div>

                            <div className="coupon-field">
                                <label>Minimum Order Amount</label>
                                <input
                                    type="number"
                                    name="minOrderAmount"
                                    placeholder="1000"
                                    value={coupon.minOrderAmount}
                                    onChange={inputHandler}
                                />
                            </div>
                        </div>

                        <div className="coupon-row">
                            <div className="coupon-field">
                                <label>Maximum Discount</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    placeholder="500"
                                    value={coupon.maxDiscount}
                                    onChange={inputHandler}
                                />
                            </div>

                            <div className="coupon-field">
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={coupon.expiryDate}
                                    onChange={inputHandler}
                                    required
                                />
                            </div>
                        </div>

                        <div className="coupon-row">
                            <div className="coupon-field">
                                <label>Usage Limit</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    placeholder="100"
                                    value={coupon.usageLimit}
                                    onChange={inputHandler}
                                />
                            </div>

                            <div className="coupon-field">
                                <label>User Type</label>
                                <select
                                    name="userType"
                                    value={coupon.userType}
                                    onChange={inputHandler}
                                >
                                    <option value="all">All Users</option>
                                    <option value="new">New Users</option>
                                    <option value="old">Old Users</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="coupon-submit"
                        >
                            Add Coupon
                        </button>
                    </form>
                </div>
                <div className="coupon-table-box mt-4">
                    <h3>Coupon List</h3>
                    <div className="coupon-table-wrapper">
                        <table className="coupon-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Min Order</th>
                                    <th>Max Discount</th>
                                    <th>Expiry</th>
                                    <th>Usage Limit</th>
                                    <th>User Type</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {couponData.length > 0 ? (
                                    couponData.map((item) => (
                                        <tr key={item._id}>
                                            <td>{item.code}</td>

                                            <td>
                                                {item.discountType === "percentage"
                                                    ? `${item.discountValue}%`
                                                    : `₹${item.discountValue}`}
                                            </td>

                                            <td>
                                                ₹{item.minOrderAmount || 0}
                                            </td>

                                            <td>
                                                {item.maxDiscount
                                                    ? `₹${item.maxDiscount}`
                                                    : "No Limit"}
                                            </td>

                                            <td>
                                                {new Date(
                                                    item.expiryDate
                                                ).toLocaleDateString()}
                                            </td>

                                            <td>
                                                {item.usageLimit
                                                    ? item.usageLimit
                                                    : "Unlimited"}
                                            </td>

                                            <td>
                                                {item.userType === "new"
                                                    ? "New Users"
                                                    : item.userType === "old"
                                                    ? "Old Users"
                                                    : "All Users"}
                                            </td>

                                            <td>
                                                <button
                                                    onClick={() =>
                                                        deleteCoupon(item._id)
                                                    }
                                                    className="coupon-delete"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">
                                            No Coupon Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Coupon;

