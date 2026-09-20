import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./css/banner.css";

export const Banner = () => {

    const [banners, setBanners] = useState([]);

    const GetBanner = async () => {
        try {
            const res = await axios.get(
                "http://localhost:4000/getbanner",{
                    withCredentials : true
                }
            );

            setBanners(res.data.BannerData);

        } catch (error) {
            console.log("GET BANNER ERROR:", error);
        }
    };

    useEffect(() => {
        GetBanner();
    }, []);

    return (
        <div
            id="fashionHubCarousel"
            className="carousel slide fashion-carousel "
            data-bs-ride="carousel"    >
            <div className="carousel-indicators">
                {banners.map((item, index) => (
                    <button
                        key={item._id}
                        type="button"
                        data-bs-target="#fashionHubCarousel"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : undefined}
                    ></button>

                ))}

            </div>

            <div className="carousel-inner">

                {banners.map((item, index) => (

                    <div
                        key={item._id}
                        className={`carousel-item ${
                            index === 0 ? "active" : ""
                        }`}
                    >

                        <img
                            src={`http://localhost:4000/uploads/banner/${item.image}`}
                            className="d-block w-100 bnr-img"
                            alt={item.title}
                        />

                        <div className="carousel-caption fashion-caption">

                            <span>
                                {item.title}
                            </span>

                            <h1>
                                {item.heading}
                            </h1>

                            <p>
                                {item.description}
                            </p>

                            <button className="shop-now-btn">
                                {item.buttonText} →
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#fashionHubCarousel"
                data-bs-slide="prev"
            >
                <span className="carousel-control-prev-icon"></span>

                <span className="visually-hidden">
                    Previous
                </span>
            </button>

            <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#fashionHubCarousel"
                data-bs-slide="next"
            >
                <span className="carousel-control-next-icon"></span>

                <span className="visually-hidden">
                    Next
                </span>
            </button>

        </div>
    );
};

export default Banner;