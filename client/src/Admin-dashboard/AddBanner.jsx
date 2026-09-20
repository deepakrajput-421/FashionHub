import axios from "axios";
import React, { useEffect, useState } from "react";
import "./AddBanner.css";
import SideBar from "./SideBar";
import { toast } from "react-toastify";

const AddBanner = () => {

    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [heading, setHeading] = useState("");
    const [description, setDescription] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [BannerData, setBannerData] = useState([]);

    const GetBanner = async () => {
        try {
            const res = await axios.get(
                "https://fashionhub-tj47.onrender.com/getbanner"
            );

            setBannerData(res.data.BannerData || []);
        } catch (error) {
            console.log("GET BANNER ERROR:", error);
        }
    };

    useEffect(() => {
        GetBanner();
    }, []);

    const AddBanner = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please select image");
            return;
        }

        if (!title || !heading || !description || !buttonText) {
            alert("Please fill all fields");
            return;
        }

        const formData = new FormData();

        formData.append("image", image);
        formData.append("title", title);
        formData.append("heading", heading);
        formData.append("description", description);
        formData.append("buttonText", buttonText);

        try {
            await axios.post(
                "https://fashionhub-tj47.onrender.com/addbanner",
                formData,
                {
                    withCredentials: true
                }
            );

            toast.success("Banner added successfully");

            setImage(null);
            setTitle("");
            setHeading("");
            setDescription("");
            setButtonText("");

            const imageInput = document.getElementById("bannerImage");

            if (imageInput) {
                imageInput.value = "";
            }

            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.log("ADD BANNER ERROR:", error);

            if (error.response?.status === 401) {
                alert("Admin login required");
            } else {
                alert(
                    error.response?.data?.message ||
                    "Failed to add banner"
                );
            }
        }
    };

    const DeleteBanner = async (id) => {
        try {
            await axios.delete(
                `https://fashionhub-tj47.onrender.com/deletebanner/${id}`,
                {
                    withCredentials: true
                }
            );

            toast.error("Banner deleted successfully");

            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.log("DELETE BANNER ERROR:", error);

            if (error.response?.status === 401) {
                alert("Admin login required");
            } else {
                alert(
                    error.response?.data?.message ||
                    "Failed to delete banner"
                );
            }
        }
    };

    return (
        <div className="add-banner-page container-fluid">

            <div className="row">

                <div className="col-lg-3 col-md-4 sidebar-col">
                    <SideBar />
                </div>

                <div className="col-lg-9 col-md-8 banner-content">

                    <div className="banner-upload">

                        <h3>Add Banner</h3>

                        <form onSubmit={AddBanner}>

                            <input
                                type="text"
                                placeholder="Banner Title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                            />

                            <input
                                type="text"
                                placeholder="Banner Heading"
                                value={heading}
                                onChange={(e) =>
                                    setHeading(e.target.value)
                                }
                            />

                            <textarea
                                placeholder="Banner Description"
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                            ></textarea>

                            <input
                                type="text"
                                placeholder="Button Text"
                                value={buttonText}
                                onChange={(e) =>
                                    setButtonText(e.target.value)
                                }
                            />

                            <input
                                type="file"
                                id="bannerImage"
                                accept="image/*"
                                onChange={(e) =>
                                    setImage(e.target.files[0])
                                }
                            />

                            <button type="submit">
                                Upload Banner
                            </button>

                        </form>

                    </div>

                    <div className="banner-table">

                        <h3>Banner List</h3>

                        <div className="banner-table-responsive">

                            <table className="banner-list-table">

                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Banner</th>
                                        <th>Title</th>
                                        <th>Heading</th>
                                        <th>Description</th>
                                        <th>Button</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {BannerData.length > 0 ? (

                                        BannerData.map((item, index) => {

                                            return (
                                                <tr key={item._id}>

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        <img
                                                            src={`https://fashionhub-tj47.onrender.com/uploads/banner/${item.image}`}
                                                            alt="banner"
                                                            className="banner-preview"
                                                        />
                                                    </td>

                                                    <td>
                                                        {item.title}
                                                    </td>

                                                    <td>
                                                        {item.heading}
                                                    </td>

                                                    <td>
                                                        {item.description}
                                                    </td>

                                                    <td>
                                                        {item.buttonText}
                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="delete-banner"
                                                            onClick={() =>
                                                                DeleteBanner(
                                                                    item._id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </td>

                                                </tr>
                                            );

                                        })

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="banner-no-data"
                                            >
                                                No Banner Found
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AddBanner;