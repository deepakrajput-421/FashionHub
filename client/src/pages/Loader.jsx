import React from "react";
import "./Loader.css";
import Flogo from "../assest/images/Fashionhub logo.png";

const Loader = () => {
    return (
        <div className="fh-loader">
            <div className="fh-loader-content">
                <img src={Flogo} alt="FashionHub" className="fh-loader-logo" />
                <div className="fh-loader-spinner"></div>
                <p>Loading FashionHub...</p>
            </div>
        </div>
    );
};

export default Loader;