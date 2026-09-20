
import "./css/About.css";
function About() {
    return (
         <>
        <section className="about-section " id="about">
            <div className="about-container">
                <div className="about-heading">
                    <p>ABOUT FASHIONHUB</p>
                    <h1>Fashion That Defines Your Style</h1>
                    <span></span>
                </div>

                <div className="about-content">
                    <p>
                        Welcome to FashionHub — your one-stop destination for
                        trendy, stylish and affordable fashion.
                    </p>

                    <p>
                        We bring you a wide range of T-Shirts, Shirts, Jeans
                        and other stylish outfits designed for everyday
                        comfort and modern looks.
                    </p>

                    <p>
                        Our goal is to provide quality fashion at reasonable
                        prices while making your shopping experience simple,
                        smooth and enjoyable.
                    </p>
                </div>

                <div className="about-features">

                    <div className="about-box">
                        <div>👕</div>
                        <h3>Trendy Collection</h3>
                        <p>Latest styles for every occasion.</p>
                    </div>

                    <div className="about-box">
                        <div>💰</div>
                        <h3>Affordable Prices</h3>
                        <p>Great fashion at reasonable prices.</p>
                    </div>

                    <div className="about-box">
                        <div>⭐</div>
                        <h3>Quality Products</h3>
                        <p>Comfortable and reliable clothing.</p>
                    </div>

                    <div className="about-box">
                        <div>🚚</div>
                        <h3>Easy Shopping</h3>
                        <p>Simple and smooth shopping experience.</p>
                    </div>

                </div>

            </div>
        </section>
       </>
    );
}

export default About;