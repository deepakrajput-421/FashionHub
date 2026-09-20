
import React, { useEffect, useState } from "react";
import "./category.css";
import SideBar from "./SideBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddCategory = () => {
    const navigate = useNavigate();
    const [CategoryData, setCategoryData] = useState({
        Gender: "",
        CategoryName: ""
    });
    const [AllCategory, setAllCategory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(AllCategory.length / itemsPerPage);
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentCategories = AllCategory.slice(
        firstIndex,
        lastIndex
    );

    const inputHandler = (event) => {
        setCategoryData({
            ...CategoryData,
            [event.target.name]: event.target.value
        });
    };

    const AddcategoryData = async (event) => {
        event.preventDefault();

        try {
            await axios.post(
                "https://fashionhub-tj47.onrender.com/AddCategory",
                CategoryData,
                {
                    withCredentials: true
                }
            );

            setCategoryData({
                Gender: "",
                CategoryName: ""
            });

            const res = await axios.get(
                "https://fashionhub-tj47.onrender.com/getcategory",
                {
                    withCredentials: true
                }
            );

            setAllCategory(res.data.CData || []);
            setCurrentPage(1);
            toast.success("Category Added Successfully");

        } catch (error) {
            console.log("ADD CATEGORY ERROR:", error);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            }
        }
    };

    const GetAllCategory = async () => {
        try {
            const res = await axios.get(
                'https://fashionhub-tj47.onrender.com/getcategory',
                {
                    withCredentials: true
                }
            );

            setAllCategory(res.data.CData || []);

        } catch (error) {
            console.log("GET CATEGORY ERROR:", error);
        }
    };

    useEffect(() => {
        GetAllCategory();
    }, []);

    const DeleteCategory = async (id) => {
        try {
            await axios.delete(
                `https://fashionhub-tj47.onrender.com/deletecategory/${id}`,
                {
                    withCredentials: true
                }
            );
             toast.success("Category Deleted Successfully");
            await GetAllCategory();

        } catch (error) {
            console.log("DELETE CATEGORY ERROR:", error);
        }
    };

    return (
        <div className="admin-category-page">
            <SideBar />

            <div className="category-main">

                <div className="category-header">
                    <h1>Add Category</h1>
                    <p>Manage your clothing categories</p>
                </div>

                <div className="category-content">

                    <div className="add-category-box">
                        <h2>Add New Category</h2>

                        <form onSubmit={AddcategoryData}>

                            <label>
                                Gender
                            </label>

                            <select
                                name="Gender"
                                value={CategoryData.Gender}
                                onChange={inputHandler}
                                required
                            >
                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Men">
                                    Men
                                </option>

                                <option value="Women">
                                    Women
                                </option>

                                <option value="Kids">
                                    Kids
                                </option>
                            </select>

                            <label>
                                Category Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter category name"
                                name="CategoryName"
                                value={CategoryData.CategoryName}
                                onChange={inputHandler}
                                required
                            />

                            <button type="submit">
                                Add Category
                            </button>

                        </form>
                    </div>

                    <div className="category-table-box">

                        <div className="table-heading">
                            <h2>
                                Categories
                            </h2>

                            <span>
                                {AllCategory.length} Categories
                            </span>
                        </div>

                        <table className="table table-hover">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Gender</th>
                                    <th>Category Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {currentCategories.length > 0 ? (

                                    currentCategories.map(
                                        (item, index) => (

                                            <tr key={item._id}>

                                                <td>
                                                    {firstIndex + index + 1}
                                                </td>

                                                <td>
                                                    {item.Gender}
                                                </td>

                                                <td>
                                                    {item.CategoryName}
                                                </td>

                                                <td>

                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            DeleteCategory(item._id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center"
                                        >
                                            No categories found
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                        {totalPages > 1 && (

                            <nav
                                aria-label="Category pagination"
                                className="mt-4"
                            >

                                <ul className="pagination justify-content-center">

                                    <li
                                        className={`page-item ${
                                            currentPage === 1
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >

                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            <span className="text-dark">
                                                Previous
                                            </span>
                                        </button>

                                    </li>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => (

                                            <li
                                                key={index}
                                                className={`page-item ${
                                                    currentPage === index + 1
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >

                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            index + 1
                                                        )
                                                    }
                                                >
                                                    <span className="text-dark">
                                                        {index + 1}
                                                    </span>
                                                </button>

                                            </li>

                                        )
                                    )}

                                    <li
                                        className={`page-item ${
                                            currentPage === totalPages
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >

                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            <span className="text-dark">
                                                Next
                                            </span>
                                        </button>

                                    </li>

                                </ul>

                            </nav>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AddCategory;