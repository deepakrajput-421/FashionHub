import React, { useState, useEffect } from "react";
import "./AddCloth.css";
import axios from "axios";
import SideBar from "./SideBar";
import { useNavigate } from "react-router-dom";

export const AddCloth = () => {
    const navigate = useNavigate();
    const [Data, setData] = useState({
        ClothName: '',
        detail: '',
        price: '',
        gender: '',
        category: '',
        image: ''
    });
    const [sizes, setSizes] = useState([
        { size: '', stock: '' }
    ]);
    const inputHandler = (event) => {
        setData({
            ...Data,
            [event.target.name]: event.target.value
        });
    };
    const FileHandler = (event) => {
        setData({
            ...Data,
            [event.target.name]: event.target.files[0]
        });
    };
    // SIZE + STOCK
    const sizeHandler = (index, field, value) => {
        const updatedSizes = [...sizes];
        updatedSizes[index][field] = value;
        setSizes(updatedSizes);
    };
    const addSize = () => {
        setSizes([
            ...sizes,
            {
                size: '',
                stock: ''
            }
        ]);
    };
    const removeSize = (index) => {
        if (sizes.length === 1) return;
        const updatedSizes = sizes.filter(
            (_, i) => i !== index
        );
        setSizes(updatedSizes);
    };
    // ADD CLOTH
    const Addcloth = async (event) => {
        event.preventDefault();
            const formData = new FormData();
            formData.append( "ClothName",Data.ClothName );
            formData.append("detail", Data.detail);
            formData.append("price",Data.price);
            formData.append("gender",Data.gender);
            formData.append("category",Data.category);
            formData.append("sizes",JSON.stringify(sizes));
            formData.append("image",Data.image);
            await axios.post(`http://localhost:4000/AddData`, formData ,{withCredentials: true}); 
               navigate("/dashboard");
    };

    // CATEGORY
    const [AllCategory, setAllCategory] = useState([]);

    const GetAllCategory = async () => {
            const res = await axios.get(`http://localhost:4000/getcategory`);
            setAllCategory(
                res.data.CData
            );
    };
    useEffect(() => {
        GetAllCategory();
    }, []);
    // GET GENDER
    const AllGender = [
        ...new Set(
            AllCategory.map(
                (item) => item.Gender
            )
        )
    ];
    return (
        <div className="add-cloth-page">
            <SideBar />
            <div className="add-cloth-card">
                <div className="form-header">
                    <span>FASHIONHUB</span>
                    <h1>Add New Cloth</h1>
                    <p> Add a new product to your FashionHub collection</p>
                </div>
                <form onSubmit={Addcloth}>
                    {/* CLOTH NAME */}
                    <div className="add-cloth-form-group">
                        <label>Cloth Name</label>
                        <input type="text" name="ClothName" placeholder="Enter cloth name" onChange={inputHandler} required />
                    </div>
                    {/* DETAIL */}
                    <div className="add-cloth-form-group">
                        <label> Cloth Detail </label>
                        <input type="text" name="detail" placeholder="Enter cloth details..." onChange={inputHandler} required/>
                    </div>
                    {/* PRICE */}
                    <div className="add-cloth-form-group">
                        <label>Price</label>

                        <div className="price-input">

                            <span>₹</span>

                            <input
                                type="number"
                                name="price"
                                placeholder="Enter price"
                                onChange={inputHandler}
                                required
                            />

                        </div>

                    </div>


                    {/* ROW */}

                    <div className="add-cloth-form-row">


                        {/* GENDER */}

                        <div className="add-cloth-form-group">

                            <label>Gender</label>
                            <select
                                name="gender"
                                value={Data.gender}
                                onChange={inputHandler}
                                required
                            >
                                <option value="">
                                    Select Gender
                                </option>
                                {AllGender.map(
                                    (item, index) => (

                                        <option
                                            value={item}
                                            key={index}
                                        >
                                            {item}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        {/* IMAGE */}

                        <div className="add-cloth-form-group">
                            <label>Cloth Image</label>
                            <input
                                type="file"
                                name="image"
                                className="p-2"
                                required
                                onChange={FileHandler}
                            />

                        </div>


                        {/* CATEGORY */}

                        <div className="add-cloth-form-group">

                            <label>Category</label>

                            <select
                                name="category"
                                value={Data.category}
                                onChange={inputHandler}
                                required
                            >

                                <option value="">
                                    Select category
                                </option>

                                {AllCategory
                                    .filter(
                                        (item) =>
                                            item.Gender === Data.gender
                                    )
                                    .map(
                                        (item, index) => (

                                            <option
                                                value={item.CategoryName}
                                                key={item._id || index}
                                            >

                                                {item.CategoryName}

                                            </option>

                                        )
                                    )}

                            </select>

                        </div>


                        {/* TYPE */}

                    </div>


                    {/* SIZE STOCK */}

                    <div className="size-stock-container">

                        <div className="size-stock-heading">

                            <label>Size & Stock</label>

                            <button
                                type="button"
                                onClick={addSize}
                            >
                                + Add Size
                            </button>

                        </div>


                        <div className="size-stock-header">

                            <span>
                                Size
                            </span>

                            <span>
                                Stock
                            </span>

                            <span></span>

                        </div>


                        {sizes.map(
                            (item, index) => (

                                <div
                                    className="size-stock-row"
                                    key={index}
                                >

                                    <select
                                        value={item.size}
                                        onChange={(e) =>
                                            sizeHandler(
                                                index,
                                                "size",
                                                e.target.value
                                            )
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Size
                                        </option>

                                        <option value="S">
                                            S
                                        </option>

                                        <option value="M">
                                            M
                                        </option>

                                        <option value="L">
                                            L
                                        </option>

                                        <option value="XL">
                                            XL
                                        </option>

                                        <option value="XXL">
                                            XXL
                                        </option>

                                        <option value="28">
                                            28
                                        </option>

                                        <option value="30">
                                            30
                                        </option>

                                        <option value="32">
                                            32
                                        </option>

                                        <option value="34">
                                            34
                                        </option>

                                        <option value="36">
                                            36
                                        </option>

                                    </select>


                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Stock"
                                        value={item.stock}
                                        onChange={(e) =>
                                            sizeHandler(
                                                index,
                                                "stock",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />


                                    <button
                                        type="button"
                                        className="remove-size"
                                        onClick={() =>
                                            removeSize(index)
                                        }
                                        disabled={
                                            sizes.length === 1
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )}

                    </div>


                    {/* BUTTONS */}

                    <div className="form-buttons">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-cloth-submit-btn"
                        >
                            Add Cloth
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddCloth;