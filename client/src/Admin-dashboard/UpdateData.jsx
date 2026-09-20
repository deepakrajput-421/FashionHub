import React, { useCallback, useState, useEffect } from "react";
import "./AddCloth.css";
import axios from "axios";
import SideBar from "./SideBar";
import { useNavigate, useParams } from "react-router-dom";

export const UpdateData = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const [UpdateData, setUpdateData] = useState({
        ClothName: '',
        detail: '',
        price: '',
        gender: '',
        category: '',
        sizes: [],
        image: '',
        Weartype: ''
    });


    const inputHandler = (event) => {
        setUpdateData({
            ...UpdateData,
            [event.target.name]: event.target.value
        });
    };


    const FileHandler = (event) => {
        setUpdateData({
            ...UpdateData,
            [event.target.name]: event.target.files[0]
        });
    };


    // SIZE CHANGE
    const SizeHandler = (index, field, value) => {

        const updatedSizes = [...UpdateData.sizes];

        updatedSizes[index] = {
            ...updatedSizes[index],
            [field]: value
        };

        setUpdateData({
            ...UpdateData,
            sizes: updatedSizes
        });

    };


    // ADD SIZE
    const AddSize = () => {

        setUpdateData({
            ...UpdateData,
            sizes: [
                ...UpdateData.sizes,
                {
                    size: '',
                    stock: ''
                }
            ]
        });

    };


    // REMOVE SIZE
    const RemoveSize = (index) => {

        const updatedSizes =
            UpdateData.sizes.filter(
                (_, i) => i !== index
            );

        setUpdateData({
            ...UpdateData,
            sizes: updatedSizes
        });

    };


    // UPDATE CLOTH
    const Updatecloth = async (event) => {

        event.preventDefault();

        try {

            const formData = new FormData();

            formData.append(
                "ClothName",
                UpdateData.ClothName
            );

            formData.append(
                "detail",
                UpdateData.detail
            );

            formData.append(
                "price",
                UpdateData.price
            );

            formData.append(
                "gender",
                UpdateData.gender
            );

            formData.append(
                "category",
                UpdateData.category
            );

            formData.append(
                "sizes",
                JSON.stringify(UpdateData.sizes)
            );

            formData.append(
                "Weartype",
                UpdateData.Weartype
            );

            if (UpdateData.image) {
                formData.append(
                    "image",
                    UpdateData.image
                );
            }

            await axios.put(
                `https://fashionhub-tj47.onrender.com/NewData/${id}`,
                formData , {
                    withCredentials : true
                }
            );

            navigate('/manage-data');

        } catch (error) {

            console.log(
                "UPDATE CLOTH ERROR:",
                error
            );

        }

    };


    // GET SINGLE DATA
    const Getdata = useCallback(async () => {

        try {

            const res = await axios.get(
                `https://fashionhub-tj47.onrender.com/update/${id}`,
                {
                    withCredentials: true
                }
            );

            setUpdateData(res.data.result);

        } catch (error) {

            console.log(
                "GET UPDATE DATA ERROR:",
                error
            );

        }

    }, [id]);


    // CATEGORY
    const [AllCategory, setAllCategory] = useState([]);

    const GetAllCategory = async () => {

        try {

            const res = await axios.get(
                `https://fashionhub-tj47.onrender.com/getcategory`
            );

            setAllCategory(res.data.CData);

        } catch (error) {

            console.log(
                "GET CATEGORY ERROR:",
                error
            );

        }

    };


useEffect(() => {

    Getdata();
    GetAllCategory();

},  [id, Getdata]);


    return (

        <div className="add-cloth-page">

            <SideBar />

            <div className="add-cloth-card">

                <div className="form-header">

                    <span>FASHIONHUB</span>

                    <h1>Update Cloth</h1>

                    <p>
                        Update your FashionHub product
                    </p>

                </div>


                <form onSubmit={Updatecloth}>

                    {/* Cloth Name */}

                    <div className="add-cloth-form-group">

                        <label>
                            Cloth Name
                        </label>

                        <input
                            type="text"
                            name="ClothName"
                            value={UpdateData.ClothName}
                            placeholder="Enter cloth name"
                            onChange={inputHandler}
                            required
                        />

                    </div>


                    {/* Cloth Detail */}

                    <div className="add-cloth-form-group">

                        <label>
                            Cloth Detail
                        </label>

                        <input
                            name="detail"
                            value={UpdateData.detail}
                            placeholder="Enter cloth details..."
                            onChange={inputHandler}
                            required
                        />

                    </div>


                    {/* Price */}

                    <div className="add-cloth-form-group">

                        <label>
                            Price
                        </label>

                        <div className="price-input">

                            <span>₹</span>

                            <input
                                type="number"
                                name="price"
                                value={UpdateData.price}
                                placeholder="Enter price"
                                onChange={inputHandler}
                                required
                            />

                        </div>

                    </div>


                    <div className="add-cloth-form-row">


                        {/* Gender */}

                        <div className="add-cloth-form-group">

                            <label>
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={UpdateData.gender}
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

                            </select>

                        </div>


                        {/* Image */}

                        <div className="add-cloth-form-group">

                            <label>
                                Cloth Image
                            </label>

                            <input
                                type="file"
                                name="image"
                                className="p-2"
                                onChange={FileHandler}
                            />

                        </div>


                        {/* Category */}

                        <div className="add-cloth-form-group">

                            <label>
                                Category
                            </label>

                            <select
                                name="category"
                                value={UpdateData.category}
                                onChange={inputHandler}
                                required
                            >

                                <option value="">
                                    Select category
                                </option>

                                {AllCategory.map(
                                    (item, index) => {

                                        return (

                                            <option
                                                value={
                                                    item.CategoryName
                                                }
                                                key={item.id}
                                            >

                                                {
                                                    item.CategoryName
                                                }

                                            </option>

                                        );

                                    }
                                )}

                            </select>

                        </div>


                    </div>


                    {/* SIZE + STOCK */}

                    <div className="size-stock-container">

                        <div className="size-stock-heading">

                            <label>
                                Size & Stock
                            </label>

                            <button
                                type="button"
                                onClick={AddSize}
                            >
                                + Add Size
                            </button>

                        </div>


                        {UpdateData.sizes?.map(
                            (sizeItem, index) => (

                                <div
                                    className="size-stock-row"
                                    key={index}
                                >

                                    <select
                                        value={
                                            sizeItem.size
                                        }
                                        onChange={(e) =>
                                            SizeHandler(
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
                                        value={
                                            sizeItem.stock
                                        }
                                        onChange={(e) =>
                                            SizeHandler(
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
                                            RemoveSize(index)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )}

                    </div>


                    {/* Buttons */}

                    <div className="form-buttons">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                navigate('/manage-data')
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-cloth-submit-btn"
                        >
                            Update Cloth
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
};
export default UpdateData;