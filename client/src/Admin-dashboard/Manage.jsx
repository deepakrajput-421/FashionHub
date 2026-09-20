
import React, { useEffect, useState } from "react";
import "./Manage.css";
import { SideBar } from "./SideBar";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

export const Manage = () => {

    const [GetData, setGetData] = useState([]);
    const navigate = useNavigate();

    const Clothdata = async () => {
        try {
            const result = await axios.get(
                `https://fashionhub-tj47.onrender.com/GetData`
            );

            setGetData(result.data.ClothData);

        } catch (error) {
            console.log("GET CLOTH ERROR:", error);
        }
    };

    useEffect(() => {
        Clothdata();
    }, []);


    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const totalPages = Math.ceil(
        GetData.length / itemsPerPage
    );

    const firstIndex =
        (currentPage - 1) * itemsPerPage;

    const lastIndex =
        firstIndex + itemsPerPage;

    const currentData =
        GetData.slice(firstIndex, lastIndex);


    // Delete code
    const DeleteData = async (id) => {

        try {

            await axios.delete(
                `https://fashionhub-tj47.onrender.com/deletedata/${id}`,
    {
        withCredentials: true
    }
            );

            await Clothdata();

        } catch (error) {

            console.log(
                "DELETE CLOTH ERROR:",
                error
            );

        }

    };


    return (

        <div className="dashboard">

            <SideBar />

            <main className="main-content">

                {/* Header */}

                <header className="topbar">

                    <div className="search-box">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search clothes..."
                        />

                    </div>


                    <div className="header-right">

                        <div className="profile">

                            <div className="profile-info">

                                <strong>
                                    Deepak Singh Rajput
                                </strong>

                                <small>
                                    Administrator
                                </small>

                            </div>

                        </div>

                    </div>

                </header>


                {/* Content */}

                <section className="content-grid">

                    <Link
                        to="/add-cloth"
                        className="add-btn btn btn-dark"
                    >
                        Add New Item
                    </Link>


                    <div className="books-section">

                        <div className="table-container">

                            <table>

                                <thead>

                                    <tr>

                                        <th>IMAGE</th>

                                        <th>CLOTH</th>

                                        <th>GENDER</th>

                                        <th>CATEGORY</th>

                                        <th>PRICE</th>

                                        <th>SIZE / STOCK</th>

                                        <th>ACTION</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {currentData.map(
                                        (item, index) => {

                                            return (

                                                <tr
                                                    key={item._id}
                                                >

                                                    {/* IMAGE */}

                                                    <td>

                                                        <img
                                                            src={`https://fashionhub-tj47.onrender.com/uploads/${item.image}`}
                                                            alt={item.ClothName}
                                                            className="cloth-image"
                                                        />

                                                    </td>


                                                    {/* CLOTH */}

                                                    <td>

                                                        <div className="book-info">

                                                            <div>

                                                                <strong>
                                                                    {item.ClothName}
                                                                </strong>

                                                                <small>
                                                                    {item.detail}
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* GENDER */}

                                                    <td>

                                                        <strong>
                                                            {item.gender}
                                                        </strong>

                                                    </td>


                                                    {/* CATEGORY */}

                                                    <td>

                                                        <strong>
                                                            {item.category}
                                                        </strong>

                                                    </td>


                                                    {/* PRICE */}

                                                    <td>

                                                        <strong>
                                                            ₹{item.price}
                                                        </strong>

                                                    </td>


                                                    {/* SIZE + STOCK */}

                                                    <td>

                                                        <div className="manage-size-stock">

                                                            {item.sizes?.map(
                                                                (sizeItem, index) => (

                                                                    <span
                                                                        key={index}
                                                                    >

                                                                        {sizeItem.size}
                                                                        {" : "}
                                                                        {sizeItem.stock}

                                                                    </span>

                                                                )
                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="edit-btn"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/update/${item._id}`
                                                                    )
                                                                }
                                                            >

                                                                <FaEdit />

                                                            </button>


                                                            <button
                                                                className="delete-btn"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    DeleteData(
                                                                        item._id
                                                                    )
                                                                }
                                                            >

                                                                <FaTrash />

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>


                            {/* Pagination */}

                            {totalPages > 1 && (

                                <nav
                                    aria-label="Cloth pagination"
                                    className="mt-4"
                                >

                                    <ul className="pagination justify-content-center">


                                        {/* Previous */}

                                        <li
                                            className={`page-item ${
                                                currentPage === 1
                                                    ? "disabled"
                                                    : ""
                                            }`}
                                        >

                                            <button
                                                className="page-link pagination-dark"
                                                onClick={() =>
                                                    setCurrentPage(
                                                        currentPage - 1
                                                    )
                                                }
                                                disabled={
                                                    currentPage === 1
                                                }
                                            >

                                                Previous

                                            </button>

                                        </li>


                                        {/* Page Numbers */}

                                        {Array.from(
                                            {
                                                length: totalPages
                                            },
                                            (_, index) => (

                                                <li
                                                    key={index}
                                                    className={`page-item ${
                                                        currentPage ===
                                                        index + 1
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                >

                                                    <button
                                                        className="page-link pagination-dark"
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                index + 1
                                                            )
                                                        }
                                                    >

                                                        {index + 1}

                                                    </button>

                                                </li>

                                            )
                                        )}


                                        {/* Next */}

                                        <li
                                            className={`page-item ${
                                                currentPage ===
                                                totalPages
                                                    ? "disabled"
                                                    : ""
                                            }`}
                                        >

                                            <button
                                                className="page-link pagination-dark"
                                                onClick={() =>
                                                    setCurrentPage(
                                                        currentPage + 1
                                                    )
                                                }
                                                disabled={
                                                    currentPage ===
                                                    totalPages
                                                }
                                            >

                                                Next

                                            </button>

                                        </li>

                                    </ul>

                                </nav>

                            )}

                        </div>

                    </div>

                </section>


                <footer>

                    © 2026 FashionHub. All rights reserved.

                </footer>

            </main>

        </div>

    );

};

export default Manage;