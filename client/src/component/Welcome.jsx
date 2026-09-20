import { useState } from 'react'
import "./css/welcome.css";

const Welcome = () => {
    const [userName] = useState(localStorage.getItem("userName"));

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