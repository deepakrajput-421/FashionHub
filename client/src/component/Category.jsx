import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Category.css'

export const Category = () => {
    const navigate = useNavigate();
    const [AllCategory, setAllCategory] = useState([]);
    const [showAll, setShowAll] = useState(false);

  const GetAllCategory = async () => {
    try {
        const res = await axios.get(
            `https://fashionhub-tj47.onrender.com/getcategory`
        );
        setAllCategory(res.data.CData);
    } catch (error) {
        console.log("GET CATEGORY ERROR:", error);
    } finally {
        window.dispatchEvent(
            new CustomEvent("home-section-loaded", {
                detail: "category"
            })
        );
    }
};
    useEffect(() => {
        GetAllCategory();
    }, []);

    const visibleCategories = showAll
        ? AllCategory
        : AllCategory.slice(0, 6);

    return (
        <section className='Category mt-5'>
            <div className="container">
                <div className="category-heading">
                    <p>EXPLORE OUR COLLECTION</p>

                    <h1>
                        Shop By Category
                    </h1>

                    <span>
                        Find your perfect style from our latest collection
                    </span>
                </div>

                <div className="row mt-5 text-center">
                    {visibleCategories.map((item, index) => {
                        return (
                            <div className="col-sm-2 mb-4" key={index} onClick={() => navigate(`/CatData/${item.Gender}/${item.CategoryName}`)}>
                                <div className="category-grid-card">
                                    <div className="category-card-content">
                                        <h3>{item.CategoryName} </h3>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {AllCategory.length > 6 && (
                    <div className="text-center mb-2">
                        <button
                            className="btn btn-dark px-4" onClick={() => setShowAll(!showAll)}>
                            {showAll ? "Show Less" : "View All Category"}
                        </button>
                    </div>
                )}

            </div>
        </section>
    )
}