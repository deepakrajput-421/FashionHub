
import React, { useState } from "react";
import axios from "axios";
import "./css/contact.css";
import { toast } from "react-toastify";

const Contact = () => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "https://fashionhub-tj47.onrender.com/contact",
                formData
            );

            toast.success("Thank you! Your message has been sent.");

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });

        } catch (error) {
            console.log("Contact Error:", error);

            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <section className="contact-page mb-0" id="footer">

            <div className="container">

                <div className="contact-heading">
                    <span>GET IN TOUCH</span>

                    <h1>
                        Contact Us
                    </h1>

                    <p>
                        Have a question or need assistance? We'd love to hear from you.
                    </p>
                </div>

                <div className="contact-wrapper">

                    <div className="contact-info">

                        <span className="small-title">
                            CONTACT INFORMATION
                        </span>

                        <h2>
                            Let's talk about your style.
                        </h2>

                        <p>
                            Whether you have a question about our products,
                            orders, delivery or anything else, our team is
                            ready to help.
                        </p>

                        <div className="contact-detail">

                            <div className="contact-icon">
                                ✉
                            </div>

                            <div>
                                <span>Email</span>
                                <p>support@fashionhub.com</p>
                            </div>

                        </div>

                        <div className="contact-detail">

                            <div className="contact-icon">
                                ☎
                            </div>

                            <div>
                                <span>Phone</span>
                                <p>+91 99999 00000</p>
                            </div>

                        </div>

                        <div className="contact-detail">

                            <div className="contact-icon">
                                📍
                            </div>

                            <div>
                                <span>Address</span>
                                <p>
                                    Indore, Madhya Pradesh, India
                                </p>
                            </div>

                        </div>

                        <div className="contact-detail">

                            <div className="contact-icon">
                                ⏰
                            </div>

                            <div>
                                <span>Working Hours</span>
                                <p>
                                    Mon - Sat : 10:00 AM - 7:00 PM
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="contact-form-box">

                        <h2>
                            Send us a message
                        </h2>

                        <p>
                            Fill in the details below and we'll get back to you.
                        </p>

                        <form onSubmit={handleSubmit}>

                            <div className="contact-form-row">

                                <div className="contact-form-group">

                                    <label>
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="contact-form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>

                            <div className="contact-form-group">

                                <label>
                                    Subject
                                </label>

                                <input
                                    type="text"
                                    name="subject"
                                    placeholder="What is this about?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="contact-form-group">

                                <label>
                                    Message
                                </label>

                                <textarea
                                    name="message"
                                    rows="5"
                                    placeholder="Write your message..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>

                            </div>

                            <button
                                type="submit"
                                className="contact-submit"
                            >
                                Send Message
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </section>
    );
};

export default Contact;
