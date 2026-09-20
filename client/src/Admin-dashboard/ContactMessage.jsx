import React, { useEffect, useState } from "react";
import axios from "axios";
import { SideBar } from "./SideBar";
import "./ContactMessage.css";

export const ContactMessages = () => {
    const [contacts, setContacts] = useState([]);

    const GetContactData = async () => {
        try {
            const result = await axios.get("http://localhost:4000/getcontact");
            setContacts(result.data);
        } catch (error) {
            console.log("Get Contact Error:", error);
        }
    };

    useEffect(() => {
        GetContactData();
    }, []);

    const DeleteContactData = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/deletecontact/${id}`);
            GetContactData();
        } catch (error) {
            console.log("Delete Contact Error:", error);
        }
    };

    return (
        <div className="dashboard">

            <SideBar />

            <main className="main-content">

                <header className="topbar">

                    <div className="search-box">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search messages..."
                        />
                    </div>

                    <div className="header-right">
                        <div className="profile">
                            <div className="profile-info">
                                <strong>Administrator</strong>
                                <small>Deepak Singh Rajput</small>
                            </div>
                        </div>
                    </div>

                </header>

                <section className="fh-admin-contact-content">

                    <div className="fh-admin-contact-heading">
                        <h3>Contact Messages</h3>
                        <p>View messages and requests sent by users.</p>
                    </div>

                    <div className="fh-admin-contact-table-container">

                        <table className="fh-admin-contact-table">

                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>EMAIL</th>
                                    <th>SUBJECT</th>
                                    <th>MESSAGE</th>
                                    <th>DATE</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>

                            <tbody>

                                {contacts.length > 0 ? (

                                    contacts.map((item) => (

                                        <tr key={item._id}>

                                            <td>
                                                <strong>{item.name}</strong>
                                            </td>

                                            <td>
                                                {item.email}
                                            </td>

                                            <td>
                                                <span className="fh-admin-contact-subject">
                                                    {item.subject}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="fh-admin-contact-message">
                                                    {item.message}
                                                </div>
                                            </td>

                                            <td>
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleDateString("en-IN")}
                                            </td>

                                            <td>
                                                <button
                                                    className="fh-admin-contact-delete"
                                                    onClick={() =>
                                                        DeleteContactData(
                                                            item._id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="fh-admin-contact-empty"
                                        >
                                            No contact messages found.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

                <footer>
                    © 2026 FashionHub. All rights reserved.
                </footer>

            </main>

        </div>
    );
};