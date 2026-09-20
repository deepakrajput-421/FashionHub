import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaArrowLeft,
    FaArrowRight,
    FaMapMarkerAlt,
    FaLocationArrow,
    FaEdit,
    FaPlus,
    FaCheckCircle,
    FaPhone,
    FaUser,
    FaHome,
    FaSearch
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/Address.css";
import Navbar from "../component/navbar";

const Address = () => {
    const navigate = useNavigate();

    const [savedAddress, setSavedAddress] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    useEffect(() => {
        getSavedAddress();
    }, []);

    const getSavedAddress = async () => {
        try {
            const response = await axios.get(
                "https://fashionhub-tj47.onrender.com/address",
                {
                    withCredentials: true
                }
            );

            if (response.data.success && response.data.address) {
                setSavedAddress(response.data.address);
                setShowForm(false);
            } else {
                setShowForm(true);
            }
        } catch (error) {
            console.log("Get Address Error:", error);
            setShowForm(true);
        } finally {
            setLoading(false);
        }
    };

    const inputHandler = (e) => {
        const { name, value } = e.target;

        if (name === "phone" || name === "pincode") {
            if (!/^\d*$/.test(value)) {
                return;
            }
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const searchPincode = async (pincode) => {
        if (pincode.length !== 6) {
            return;
        }

        try {
            setPincodeLoading(true);

            const response = await axios.get(
                `https://api.pincodeapi.in/api/v1/pincode/${pincode}`
            );

            if (
                response.data.success &&
                response.data.data &&
                response.data.data.post_offices &&
                response.data.data.post_offices.length > 0
            ) {
                const postOffice = response.data.data.post_offices[0];

                setFormData((prev) => ({
                    ...prev,
                    city:
                        postOffice.district ||
                        postOffice.city ||
                        "",
                    state: postOffice.state || ""
                }));

                toast.success("Pincode details found");
            } else {
                toast.error("Invalid pincode");
            }
        } catch (error) {
            console.log("Pincode Error:", error);
            toast.error("Pincode search failed");
        } finally {
            setPincodeLoading(false);
        }
    };

    const handlePincodeChange = (e) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value) || value.length > 6) {
            return;
        }

        setFormData({
            ...formData,
            pincode: value
        });

        if (value.length === 6) {
            searchPincode(value);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Location is not supported by your browser");
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    const response = await axios.get(
                        "https://nominatim.openstreetmap.org/reverse",
                        {
                            params: {
                                format: "json",
                                lat: latitude,
                                lon: longitude,
                                zoom: 18,
                                addressdetails: 1
                            },
                            headers: {
                                Accept: "application/json"
                            }
                        }
                    );

                    const address = response.data.address || {};

                    setFormData((prev) => ({
                        ...prev,
                        address:
                            response.data.display_name ||
                            prev.address,
                        city:
                            address.city ||
                            address.town ||
                            address.village ||
                            address.municipality ||
                            "",
                        state: address.state || "",
                        pincode: address.postcode || ""
                    }));

                    toast.success("Current location detected");
                } catch (error) {
                    console.log("Location Address Error:", error);
                    toast.error(
                        "Location detected but address could not be loaded"
                    );
                } finally {
                    setLocationLoading(false);
                }
            },
            (error) => {
                console.log("Location Error:", error);

                setLocationLoading(false);

                if (error.code === 1) {
                    toast.error("Please allow location permission");
                } else {
                    toast.error("Unable to detect your location");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const saveAddress = async (e) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.phone ||
            !formData.address ||
            !formData.city ||
            !formData.state ||
            !formData.pincode
        ) {
            toast.error("Please fill all address details");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Enter valid 10 digit phone number");
            return;
        }

        if (formData.pincode.length !== 6) {
            toast.error("Enter valid 6 digit pincode");
            return;
        }

        try {
            setSaving(true);

            const response = await axios.post(
                "https://fashionhub-tj47.onrender.com/address",
                formData,
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setSavedAddress(response.data.address);

                sessionStorage.setItem(
                    "checkoutAddress",
                    JSON.stringify(response.data.address)
                );

                toast.success("Address saved successfully");

                navigate("/checkout");
            }
        } catch (error) {
            console.log("Save Address Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save address"
            );
        } finally {
            setSaving(false);
        }
    };

    const useSavedAddress = () => {
        if (!savedAddress) {
            return;
        }

        sessionStorage.setItem(
            "checkoutAddress",
            JSON.stringify(savedAddress)
        );

        toast.success("Saved address selected");

        navigate("/checkout");
    };

    const changeAddress = () => {
        if (savedAddress) {
            setFormData({
                name: savedAddress.name || "",
                phone: savedAddress.phone || "",
                address: savedAddress.address || "",
                city: savedAddress.city || "",
                state: savedAddress.state || "",
                pincode: savedAddress.pincode || ""
            });
        }

        setShowForm(true);
    };

    const addNewAddress = () => {
        setFormData({
            name: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            pincode: ""
        });

        setShowForm(true);
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="address-loading">
                    <div className="address-loader"></div>
                    <p>Loading your address...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="delivery-page">

                <div className="delivery-top">

                    <button
                        className="back-button mt-5"
                        onClick={() => navigate("/cart")}
                    >
                        <FaArrowLeft />
                        Back to Cart
                    </button>

                    <div className="delivery-heading">
                        <span className="heading-icon">
                            <FaMapMarkerAlt />
                        </span>

                        <div>
                            <h1>Delivery Address</h1>
                            <p>Where should we deliver your order?</p>
                        </div>
                    </div>

                </div>

                <div className="delivery-layout">

                    <div className="address-main">

                        {!showForm && savedAddress && (
                            <div className="saved-address-card">

                                <div className="saved-card-top">

                                    <div className="saved-title">
                                        <span className="saved-icon">
                                            <FaCheckCircle />
                                        </span>

                                        <div>
                                            <h2>Saved Address</h2>
                                            <p>Your default delivery address</p>
                                        </div>
                                    </div>

                                    <span className="default-badge">
                                        DEFAULT
                                    </span>

                                </div>

                                <div className="saved-address-content">

                                    <div className="saved-name">
                                        <FaUser />
                                        <strong>{savedAddress.name}</strong>
                                    </div>

                                    <div className="saved-phone">
                                        <FaPhone />
                                        <span>{savedAddress.phone}</span>
                                    </div>

                                    <div className="saved-location">
                                        <FaHome />

                                        <div>
                                            <p>{savedAddress.address}</p>

                                            <span>
                                                {savedAddress.city},{" "}
                                                {savedAddress.state} -{" "}
                                                {savedAddress.pincode}
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                <div className="saved-card-actions">

                                    <button
                                        className="use-address-btn p-3"
                                        onClick={useSavedAddress}
                                    >
                                        <FaCheckCircle  />
                                        Use This Address
                                        <FaArrowRight />
                                    </button>

                                    <button
                                        className="change-address-btn"
                                        onClick={changeAddress}
                                    >
                                        <FaEdit />
                                        Change Address
                                    </button>

                                </div>

                            </div>
                        )}

                        {showForm && (
                            <div className="address-form-card">

                                <div className="form-card-header">

                                    <div>
                                        <h2>
                                            {savedAddress
                                                ? "Change Delivery Address"
                                                : "Add Delivery Address"}
                                        </h2>

                                        <p>
                                            Enter your details for a smooth delivery
                                        </p>
                                    </div>

                                    <span className="form-location-icon">
                                        <FaMapMarkerAlt />
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className="location-button"
                                    onClick={useCurrentLocation}
                                    disabled={locationLoading}
                                >
                                    <FaLocationArrow />

                                    {locationLoading
                                        ? "Detecting Location..."
                                        : "Use My Current Location"}
                                </button>

                                <form onSubmit={saveAddress}>

                                    <div className="form-grid">

                                        <div className="input-group">
                                            <label>
                                                <FaUser />
                                                Full Name
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={inputHandler}
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>
                                                <FaPhone />
                                                Mobile Number
                                            </label>

                                            <input
                                                type="text"
                                                name="phone"
                                                maxLength="10"
                                                value={formData.phone}
                                                onChange={inputHandler}
                                                placeholder="10 digit mobile number"
                                            />
                                        </div>

                                    </div>

                                    <div className="input-group full-input">
                                        <label>
                                            <FaHome />
                                            Complete Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={inputHandler}
                                            placeholder="House no., street, area, landmark..."
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="pincode-wrapper">

                                        <div className="input-group">
                                            <label>
                                                <FaSearch />
                                                Pincode
                                            </label>

                                            <div className="pincode-input">
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    maxLength="6"
                                                    value={formData.pincode}
                                                    onChange={handlePincodeChange}
                                                    placeholder="6 digit pincode"
                                                />

                                                {pincodeLoading && (
                                                    <span className="mini-loader"></span>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="form-grid">

                                        <div className="input-group">
                                            <label>City / District</label>

                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={inputHandler}
                                                placeholder="City"
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>State</label>

                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={inputHandler}
                                                placeholder="State"
                                            />
                                        </div>

                                    </div>

                                    <div className="form-actions">

                                        {savedAddress && (
                                            <button
                                                type="button"
                                                className="cancel-form-btn"
                                                onClick={() => setShowForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            className="save-address-btn"
                                            disabled={saving}
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Save & Continue"}

                                            {!saving && <FaArrowRight />}
                                        </button>

                                    </div>

                                </form>

                            </div>
                        )}

                        {!showForm && savedAddress && (
                            <button
                                className="add-new-address"
                                onClick={addNewAddress}
                            >
                                <span>
                                    <FaPlus />
                                </span>

                                <div>
                                    <strong>Add New Address</strong>
                                    <small>
                                        Use a different delivery address
                                    </small>
                                </div>

                                <FaArrowRight />
                            </button>
                        )}

                    </div>

                    <aside className="address-side-card">

                        <div className="side-gradient">

                            <div className="side-icon">
                                <FaMapMarkerAlt />
                            </div>

                            <h3>Almost There!</h3>

                            <p>
                                Your address is the final step before
                                completing your order.
                            </p>

                        </div>

                        <div className="side-info">

                            <div>
                                <span>01</span>
                                <p>Select your address</p>
                            </div>

                            <div>
                                <span>02</span>
                                <p>Review your order</p>
                            </div>

                            <div>
                                <span>03</span>
                                <p>Place your order</p>
                            </div>

                        </div>

                        <div className="secure-address">
                            <FaCheckCircle />

                            <div>
                                <strong>Your data is secure</strong>
                                <p>
                                    Your address is only used for order delivery.
                                </p>
                            </div>
                        </div>

                    </aside>

                </div>

            </div>
        </>
    );
};

export default Address;