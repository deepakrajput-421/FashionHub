
import React, { useEffect, useState } from 'react'
import "./css/welcome.css";

const Welcome = () => {
    const [userName, setUserName] = useState(localStorage.getItem("userName"));
    const [search, setSearch] = useState("");
    const [placeholder, setPlaceholder] = useState("Search products...");

    useEffect(() => {
        const texts = [
            "Search shirts...",
            "Search jeans...",
            "Search t-shirts...",
            "Search dresses...",
            "Search new arrivals..."
        ];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % texts.length;
            setPlaceholder(texts[index]);
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    if (!userName) {
        return null;
    }

    return (
        <div className="welcome-wrapper">
            <div className="welcome-banner mt-5">
                <div className="welcome-content">
                    <span>WELCOME BACK</span>
                    <h2>Hello {userName}✨😍</h2>
                    <p>YOUR STYLE • YOUR FASHIONHUB</p>
                </div>
            </div>
        </div>
    )
}

export default Welcome