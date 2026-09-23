import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHouseDamage, FaShoppingBag, FaShoppingCart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { FiUser, FiSearch, FiX } from "react-icons/fi";
import "./css/Navbar.css";

export const Navbar = () => {
    const navigate = useNavigate();

    const [navOpen, setNavOpen] = useState(false);
    const [AllCategory, setAllCategory] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const closeNav = () => setNavOpen(false);

    const GetAllCategory = async () => {
        try {
            const res = await axios.get(
                "https://fashionhub-tj47.onrender.com/getcategory"
            );

            setAllCategory(res.data.CData || []);
        } catch (error) {
            console.log("GET CATEGORY ERROR:", error);
        }
    };

   useEffect(() => {
    const loadNavbarData = async () => {
        await Promise.all([
            GetAllCategory(),
            fetchCartCount(),
            fetchWishlistCount()
        ]);

        window.dispatchEvent(
            new CustomEvent("home-section-loaded", {
                detail: "navbar"
            })
        );
    };

    loadNavbarData();

    window.addEventListener(
        "cart-updated",
        fetchCartCount
    );

    return () => {
        window.removeEventListener(
            "cart-updated",
            fetchCartCount
        );
    };
}, []);

    const fetchWishlistCount = async () => {
        try {
            const res = await axios.get(
                "https://fashionhub-tj47.onrender.com/wishlist",
                {
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setWishlistCount((res.data.items || []).length);
            }
        } catch (error) {
            setWishlistCount(0);
        }
    };

   useEffect(() => {
    GetAllCategory();
    fetchCartCount();
    fetchWishlistCount();

    window.addEventListener(
        "cart-updated",
        fetchCartCount
    );

    return () => {
        window.removeEventListener(
            "cart-updated",
            fetchCartCount
        );
    };
}, []);

    const openSearch = () => {
        closeNav();
        setSearchOpen(true);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchText("");
    };

    const handleSearch = () => {
        const value = searchText.trim();

        if (!value) {
            navigate("/shop");
            closeSearch();
            return;
        }

        closeNav();
        closeSearch();

        navigate(
            `/shop?search=${encodeURIComponent(value)}`
        );
    };

    const handleSearchKeyDown = e => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <>
            <nav className="fh-navbar navbar navbar-expand-lg bg-white fixed-top">

                <div className="container-fluid px-3 px-md-5">

                    <Link
                        className="fh-navbar-brand navbar-brand"
                        to="/"
                        onClick={closeNav}
                    >
                        FashionHub
                    </Link>

                    {/* MOBILE SEARCH */}

                    {searchOpen ? (
                        <div className="fh-navbar-inline-search fh-navbar-mobile-search">
                            <FiSearch />

                            <input
                                type="text"
                                value={searchText}
                                onChange={e =>
                                    setSearchText(e.target.value)
                                }
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Search..."
                                autoFocus
                            />

                            <button
                                type="button"
                                onClick={closeSearch}
                                aria-label="Close search"
                            >
                                <FiX />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="fh-navbar-mobile-search fh-navbar-icon"
                            onClick={openSearch}
                            aria-label="Search"
                        >
                            <FiSearch />
                        </button>
                    )}

                    <button
                        className="fh-navbar-toggler navbar-toggler border-0 shadow-none"
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={navOpen}
                        onClick={() =>
                            setNavOpen(prev => !prev)
                        }
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div
                        className={`fh-navbar-collapse collapse navbar-collapse ${navOpen ? "show" : ""
                            }`}
                    >

                        <ul className="fh-navbar-nav navbar-nav mx-auto align-items-lg-center gap-lg-3">

                            <li className="fh-navbar-item nav-item">
                                <Link
                                    className="fh-navbar-link nav-link"
                                    to="/"
                                    onClick={closeNav}
                                >
                                    <FaHouseDamage />
                                </Link>
                            </li>

                            <li className="fh-navbar-item nav-item">
                                <Link
                                    className="fh-navbar-link nav-link"
                                    to="/shop"
                                    onClick={closeNav}
                                >
                                    <FaShoppingBag />
                                </Link>
                            </li>

                            <li className="fh-navbar-item nav-item dropdown">

                                <button
                                    type="button"
                                    className="fh-navbar-link nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Categories
                                </button>

                                <ul className="fh-navbar-dropdown dropdown-menu">

                                    {[
                                        ...new Set(
                                            AllCategory.map(
                                                item => item.Gender
                                            )
                                        )
                                    ].map(
                                        (gender, index) => (

                                            <li
                                                className="fh-navbar-submenu dropdown-submenu"
                                                key={
                                                    gender ||
                                                    index
                                                }
                                            >

                                                <button
                                                    type="button"
                                                    className="fh-navbar-dropdown-item dropdown-item dropdown-toggle"
                                                >
                                                    {gender}
                                                </button>

                                                <ul className="fh-navbar-dropdown-submenu dropdown-menu">

                                                    {AllCategory
                                                        .filter(
                                                            item =>
                                                                item.Gender ===
                                                                gender
                                                        )
                                                        .map(
                                                            (
                                                                item,
                                                                categoryIndex
                                                            ) => (

                                                                <li
                                                                    key={
                                                                        item._id ||
                                                                        categoryIndex
                                                                    }
                                                                >

                                                                    <button
                                                                        type="button"
                                                                        className="fh-navbar-dropdown-item dropdown-item"
                                                                        onClick={() => {
                                                                            closeNav();

                                                                            navigate(
                                                                                `/CatData/${item.Gender}/${item.CategoryName}`
                                                                            );
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.CategoryName
                                                                        }
                                                                    </button>

                                                                </li>

                                                            )
                                                        )}

                                                </ul>

                                            </li>

                                        )
                                    )}

                                </ul>

                            </li>

                        </ul>

                        <div className="fh-navbar-actions d-flex align-items-center gap-3 mt-3 mt-lg-0">

                            {/* DESKTOP SEARCH */}

                            {searchOpen ? (
                                <div className="fh-navbar-inline-search fh-navbar-desktop-search">
                                    <FiSearch />

                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={e =>
                                            setSearchText(e.target.value)
                                        }
                                        onKeyDown={handleSearchKeyDown}
                                        placeholder="Search..."
                                        autoFocus
                                    />

                                    <button
                                        type="button"
                                        onClick={closeSearch}
                                        aria-label="Close search"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="fh-navbar-icon fh-navbar-desktop-search"
                                    onClick={openSearch}
                                    aria-label="Search"
                                >
                                    <FiSearch />
                                </button>
                            )}

                            <Link
                                to="/account"
                                className="fh-navbar-icon"
                                onClick={closeNav}
                                aria-label="Account"
                            >
                                <FiUser />
                            </Link>

                            <Link
                                to="/wishlist"
                                className="fh-navbar-icon position-relative"
                                onClick={closeNav}
                                aria-label="Wishlist"
                            >
                                <FiHeart />

                                {wishlistCount > 0 && (
                                    <span className="fh-navbar-wishlist-badge">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/cart"
                                className="fh-navbar-icon"
                                onClick={closeNav}
                                aria-label="Cart"
                            >
                                <div className="fh-navbar-cart-wrapper">

                                    <FaShoppingCart />

                                    {cartCount > 0 && (
                                        <span className="fh-navbar-cart-count">
                                            {cartCount}
                                        </span>
                                    )}

                                </div>
                            </Link>

                        </div>

                    </div>

                </div>
            </nav>
        </>
    );
};

export default Navbar;