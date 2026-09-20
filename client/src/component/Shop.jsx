import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaHeart, FaSearch, FaChevronDown, FaTimes } from "react-icons/fa";
import "./css/Shop.css";
import Navbar from "./navbar";

const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const PRICE_GAP = 500;
const FILTERS_KEY = "shopFilters";

const getSavedFilters = () => {
    try {
        return JSON.parse(sessionStorage.getItem(FILTERS_KEY)) || {};
    } catch {
        return {};
    }
};

const Shop = () => {
    const location = useLocation();
    const savedFilters = getSavedFilters();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState(savedFilters.search || "");
    const [category, setCategory] = useState(savedFilters.category || "All");
    const [gender, setGender] = useState(savedFilters.gender || []);
    const [size, setSize] = useState(savedFilters.size || []);
    const [sort, setSort] = useState(savedFilters.sort || "Featured");
    const [minPrice, setMinPrice] = useState(
        savedFilters.minPrice ?? PRICE_MIN
    );
    const [maxPrice, setMaxPrice] = useState(
        savedFilters.maxPrice ?? PRICE_MAX
    );
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlSearch = params.get("search");

        if (urlSearch !== null) {
            setSearch(urlSearch);
        }
    }, [location.search]);

    useEffect(() => {
        sessionStorage.setItem(
            FILTERS_KEY,
            JSON.stringify({
                search,
                category,
                gender,
                size,
                sort,
                minPrice,
                maxPrice
            })
        );
    }, [
        search,
        category,
        gender,
        size,
        sort,
        minPrice,
        maxPrice
    ]);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4000/GetData"
                );

                const data =
                    response.data?.ClothData ||
                    response.data?.Data ||
                    response.data?.data ||
                    response.data?.ProductData ||
                    response.data?.AddData ||
                    response.data?.products ||
                    response.data;

                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.log("SHOP ERROR:", error);
            }
        };

        getProducts();
    }, []);

    const matchesGender = useMemo(() => {
        return item =>
            gender.length === 0 ||
            gender.some(
                selectedGender =>
                    String(item.gender || "").toLowerCase() ===
                    selectedGender.toLowerCase()
            );
    }, [gender]);

    const categories = useMemo(() => {
        const data = products.filter(matchesGender);

        return [
            "All",
            ...new Set(
                data.map(item => item.category).filter(Boolean)
            )
        ];
    }, [products, matchesGender]);

    const availableSizes = useMemo(() => {
        const sizeSet = new Set();

        let data = products.filter(matchesGender);

        if (category !== "All") {
            data = data.filter(
                item =>
                    String(item.category || "").toLowerCase() ===
                    category.toLowerCase()
            );
        }

        data.forEach(product => {
            if (Array.isArray(product.sizes)) {
                product.sizes.forEach(sizeData => {
                    if (
                        sizeData.size &&
                        Number(sizeData.stock || 0) > 0
                    ) {
                        sizeSet.add(String(sizeData.size));
                    }
                });
            }
        });

        const sizes = Array.from(sizeSet);

        const sizeOrder = [
            "XS",
            "S",
            "M",
            "L",
            "XL",
            "XXL",
            "XXXL"
        ];

        return sizes.sort((a, b) => {
            const aIndex = sizeOrder.indexOf(a.toUpperCase());
            const bIndex = sizeOrder.indexOf(b.toUpperCase());

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }

            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            const aNum = Number(a);
            const bNum = Number(b);

            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                return aNum - bNum;
            }

            return a.localeCompare(b);
        });
    }, [products, matchesGender, category]);

    const filteredProducts = useMemo(() => {
        let data = products.filter(matchesGender);

        if (search.trim()) {
            const text = search.toLowerCase().trim();

            data = data.filter(
                item =>
                    String(item.ClothName || "")
                        .toLowerCase()
                        .includes(text) ||
                    String(item.category || "")
                        .toLowerCase()
                        .includes(text) ||
                    String(item.gender || "")
                        .toLowerCase()
                        .includes(text) ||
                    String(item.detail || "")
                        .toLowerCase()
                        .includes(text)
            );
        }

        if (category !== "All") {
            data = data.filter(
                item =>
                    String(item.category || "").toLowerCase() ===
                    category.toLowerCase()
            );
        }

        if (size.length > 0) {
            data = data.filter(item =>
                item.sizes?.some(
                    sizeData =>
                        size.includes(
                            String(sizeData.size || "")
                        ) &&
                        Number(sizeData.stock || 0) > 0
                )
            );
        }

        data = data.filter(item => {
            const price = Number(item.price || 0);

            return price >= minPrice && price <= maxPrice;
        });

        if (sort === "Price Low") {
            data.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );
        }

        if (sort === "Price High") {
            data.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );
        }

        if (sort === "Newest") {
            data.reverse();
        }

        return data;
    }, [
        products,
        matchesGender,
        search,
        category,
        size,
        minPrice,
        maxPrice,
        sort
    ]);

    const getImage = image => {
        if (!image) return "";

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `http://localhost:4000/uploads/${image}`;
    };

    const isOutOfStock = product => {
        if (!product.sizes || product.sizes.length === 0) {
            return false;
        }

        return product.sizes.every(
            item => Number(item.stock || 0) <= 0
        );
    };

    const handleGender = selectedGender => {
        setCategory("All");
        setSize([]);

        setGender(prev =>
            prev.includes(selectedGender)
                ? prev.filter(item => item !== selectedGender)
                : [...prev, selectedGender]
        );
    };

    const handleSize = selectedSize => {
        setSize(prev =>
            prev.includes(selectedSize)
                ? prev.filter(item => item !== selectedSize)
                : [...prev, selectedSize]
        );
    };

    const handleCategory = selectedCategory => {
        setCategory(selectedCategory);
        setSize([]);
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("All");
        setGender([]);
        setSize([]);
        setSort("Featured");
        setMinPrice(PRICE_MIN);
        setMaxPrice(PRICE_MAX);

        if (location.search) {
            window.history.replaceState(
                {},
                "",
                "/shop"
            );
        }
    };

    const handleMinRange = value => {
        const val = Math.min(
            Number(value),
            maxPrice - PRICE_GAP
        );

        setMinPrice(Math.max(PRICE_MIN, val));
    };

    const handleMaxRange = value => {
        const val = Math.max(
            Number(value),
            minPrice + PRICE_GAP
        );

        setMaxPrice(Math.min(PRICE_MAX, val));
    };

    const minPercent = (minPrice / PRICE_MAX) * 100;
    const maxPercent = (maxPrice / PRICE_MAX) * 100;

    const closeMobileFilters = () => {
        setShowFilters(false);
    };

    return (
        <>
            <Navbar />

            <div className="shop-page">

                <div className="shop-wrapper mt-5 pt-4">

                    {showFilters && (
                        <div
                            className="sidebar-overlay"
                            onClick={closeMobileFilters}
                        />
                    )}

                    <aside
                        className={`shop-sidebar ${
                            showFilters ? "show" : ""
                        }`}
                    >

                        <div className="sidebar-mobile-header">
                            <span>Filters</span>

                            <button
                                className="sidebar-close-btn"
                                onClick={closeMobileFilters}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="sidebar-scroll">

                            <div className="filter-title">
                                <span>Filters</span>

                                <button onClick={clearFilters}>
                                    Clear All
                                </button>
                            </div>

                            <div className="filter-section">
                                <h3>Category</h3>

                                {categories.map(item => (
                                    <label
                                        className="check-row"
                                        key={item}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                category === item
                                            }
                                            onChange={() =>
                                                handleCategory(item)
                                            }
                                        />

                                        <span className="custom-check"></span>

                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="filter-section">
                                <h3>Gender</h3>

                                {["Men", "Women", "Kids"].map(item => (
                                    <label
                                        className="check-row"
                                        key={item}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={gender.includes(item)}
                                            onChange={() =>
                                                handleGender(item)
                                            }
                                        />

                                        <span className="custom-check"></span>

                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="filter-section">
                                <h3>Sizes</h3>

                                {availableSizes.length === 0 ? (
                                    <p className="no-size">
                                        No sizes available
                                    </p>
                                ) : (
                                    <div className="size-grid">
                                        {availableSizes.map(item => (
                                            <label
                                                className="check-row"
                                                key={item}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={size.includes(item)}
                                                    onChange={() =>
                                                        handleSize(item)
                                                    }
                                                />

                                                <span className="custom-check"></span>

                                                <span>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="filter-section">
                                <h3>Price Range</h3>

                                <div className="price-slider">

                                    <div className="slider-track"></div>

                                    <div
                                        className="slider-fill"
                                        style={{
                                            left: `${minPercent}%`,
                                            right: `${100 - maxPercent}%`
                                        }}
                                    ></div>

                                    <input
                                        type="range"
                                        className="range-input range-min"
                                        min={PRICE_MIN}
                                        max={PRICE_MAX}
                                        step={100}
                                        value={minPrice}
                                        onChange={e =>
                                            handleMinRange(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <input
                                        type="range"
                                        className="range-input range-max"
                                        min={PRICE_MIN}
                                        max={PRICE_MAX}
                                        step={100}
                                        value={maxPrice}
                                        onChange={e =>
                                            handleMaxRange(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="price-inputs">

                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={e =>
                                            handleMinRange(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <b>—</b>

                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={e =>
                                            handleMaxRange(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>
                            </div>

                        </div>

                        <div className="sidebar-mobile-footer">

                            <button
                                className="sidebar-btn-close"
                                onClick={closeMobileFilters}
                            >
                                Close
                            </button>

                            <button
                                className="sidebar-btn-apply"
                                onClick={closeMobileFilters}
                            >
                                Apply ({filteredProducts.length})
                            </button>

                        </div>

                    </aside>

                    <main className="shop-main">

                        <div className="shop-toolbar">

                            <div className="toolbar-left">

                                <button
                                    className="mobile-filter-btn"
                                    onClick={() =>
                                        setShowFilters(true)
                                    }
                                >
                                    Filters
                                </button>

                                <span className="product-count">
                                    {filteredProducts.length} Products
                                </span>

                            </div>

                            <div className="toolbar-right">

                                <div className="shop-search">

                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={e =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <FaSearch />

                                </div>

                                <div className="sort-box">

                                    <span>Sort</span>

                                    <select
                                        value={sort}
                                        onChange={e =>
                                            setSort(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="Featured">
                                            Featured
                                        </option>

                                        <option value="Newest">
                                            Newest
                                        </option>

                                        <option value="Price Low">
                                            Price Low
                                        </option>

                                        <option value="Price High">
                                            Price High
                                        </option>
                                    </select>

                                    <FaChevronDown />

                                </div>

                            </div>

                        </div>

                        <div className="product-grid">

                            {filteredProducts.map(product => {

                                const outOfStock =
                                    isOutOfStock(product);

                                return (
                                    <div
                                        className="shop-product"
                                        key={product._id}
                                    >

                                        <div className="product-image-wrap">

                                            <Link
                                                to={`/product/${product._id}`}
                                                className="shop-product-image"
                                            >

                                                <img
                                                    src={getImage(
                                                        product.image
                                                    )}
                                                    alt={
                                                        product.ClothName
                                                    }
                                                />

                                                {outOfStock && (
                                                    <span className="stock-badge">
                                                        Out of Stock
                                                    </span>
                                                )}

                                            </Link>

                                            <button
                                                className="shop-wishlist-btn"
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                                aria-label="Add to wishlist"
                                            >
                                                <FaHeart />
                                            </button>

                                        </div>

                                        <Link
                                            to={`/product/${product._id}`}
                                            className="shop-product-info"
                                        >

                                            <span className="shop-product-category">
                                                {product.category}
                                            </span>

                                            <h2>
                                                {product.ClothName}
                                            </h2>

                                            <span className="product-gender">
                                                {product.gender}
                                            </span>

                                            <div className="product-price">
                                                ₹
                                                {Number(
                                                    product.price || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </div>

                                        </Link>

                                    </div>
                                );
                            })}

                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="shop-no-products">
                                No products found
                            </div>
                        )}

                    </main>

                </div>

            </div>
        </>
    );
};

export default Shop;