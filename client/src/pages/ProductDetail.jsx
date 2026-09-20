
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/ProductDetail.css";
import Navbar from '../component/navbar';
import About from "../component/About";
import Contact from "../component/contact";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await axios.get(`https://fashionhub-tj47.onrender.com/getproduct/${id}`);
        setProduct(res.data);

        const relatedRes = await axios.get(
          `https://fashionhub-tj47.onrender.com/getproductbycategory/${res.data.category}`
        );

        setRelated(relatedRes.data.filter(item => item._id !== res.data._id));
      } catch (err) {
        console.log(err);
      }
    };

    getProduct();
    setQty(1);
    setSelectedSize("");
  }, [id]);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await axios.get(
          "https://fashionhub-tj47.onrender.com/wishlist",
          {
            withCredentials: true
          }
        );

        if (res.data.success) {
          const exists = res.data.items?.some(
            item => item.productId?._id === id
          );

          setIsWishlisted(exists);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.log(error);
        }
      }
    };

    checkWishlist();
  }, [id]);

  if (!product) {
    return <div className="loading">Loading...</div>;
  }

  const selectedSizeData = product.sizes?.find(s => s.size === selectedSize);
  const selectedStock = Number(selectedSizeData?.stock || 0);
  const isOutOfStock = Boolean(selectedSize) && selectedStock <= 0;

  const toggleWishlist = async () => {
    try {
      const response = await axios.post(
        "https://fashionhub-tj47.onrender.com/wishlist/toggle",
        {
          productId: product._id
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        setIsWishlisted(response.data.wishlisted);

        window.dispatchEvent(new Event("wishlist-updated"));

        toast.success(
          response.data.wishlisted
            ? "Added to wishlist"
            : "Removed from wishlist"
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login first");
        navigate("/Signup");
        return;
      }

      toast.error(
        error.response?.data?.message ||
        "Unable to update wishlist"
      );
    }
  };

  const addToCart = async (redirectToCart = false) => {
    if (!selectedSize) {
      toast.error("Please select size");
      return;
    }

    if (selectedStock <= 0) {
      toast.error("Selected size is out of stock");
      return;
    }

    if (qty > selectedStock) {
      toast.error(`Only ${selectedStock} item available in size ${selectedSize}`);
      return;
    }

    try {
      const response = await axios.post(
        "https://fashionhub-tj47.onrender.com/cart",
        {
          productId: product._id,
          quantity: qty,
          size: selectedSize
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Size ${selectedSize} added to cart`);

        window.dispatchEvent(new Event("cart-updated"));

        if (redirectToCart) {
          navigate("/cart");
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login first");
        navigate("/Signup");
        return;
      }

      toast.error(
        error.response?.data?.message || "Unable to add product to cart"
      );
    }
  };

  const increaseQty = () => {
    if (!selectedSize) {
      setQty(q => q + 1);
      return;
    }

    if (qty < selectedStock) {
      setQty(q => q + 1);
    } else {
      toast.error(`Only ${selectedStock} item available`);
    }
  };

  const decreaseQty = () => setQty(q => Math.max(1, q - 1));

  return (
    <div className="product-detail-page">
      <Navbar />

      <div className="detail-container mt-5">
        <div className="detail-image mt-3">
          <img
            src={`https://fashionhub-tj47.onrender.com/uploads/${product.image}`}
            alt={product.ClothName}
          />

          <button
            type="button"
            className={`detail-wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={toggleWishlist}
          >
            <FaHeart />
          </button>
        </div>

        <div className="detail-info mt-3">
          <p className="category">{product.category}</p>
          <h1>{product.ClothName}</h1>

          <div className="detail-rating">
            ★★★★★ <span>4.8</span>
          </div>

          <h2>₹{product.price}</h2>

          <p className="description">{product.detail}</p>

          <p className="detail-size-heading">Select Size</p>

          <div className="detail-sizes">
            {product.sizes?.map(sizeData => (
              <button
                key={sizeData.size}
                type="button"
                className={selectedSize === sizeData.size ? "selected" : ""}
                onClick={() => setSelectedSize(sizeData.size)}
              >
                {sizeData.size}
              </button>
            ))}
          </div>

          <div className={`detail-stock ${isOutOfStock ? "out-stock" : ""}`}>
            {selectedSize
              ? isOutOfStock
                ? `${selectedSize} - Out of Stock`
                : `${selectedSize} - ${selectedStock} available`
              : "Select Size"}
          </div>

          <div className="quantity">
            <span>Quantity</span>
            <button onClick={decreaseQty}>−</button>
            <b>{qty}</b>
            <button onClick={increaseQty}>+</button>
          </div>

          <div className="detail-buttons">
            <button
              className="detail-cart-btn"
              onClick={() => addToCart(false)}
            >
              Add To Cart
            </button>

            <button
              className="detail-buy-btn"
              onClick={() => addToCart(true)}
            >
              Buy Now
            </button>
          </div>

          <div className="product-features">
            <span>✓ Premium Quality</span>
            <span>✓ Easy Returns</span>
            <span>✓ Fast Delivery</span>
          </div>
        </div>
      </div>

      <div className="description-section">
        <h2>Product Details</h2>
        <p>{product.detail}</p>
      </div>

      {related.length > 0 && (
        <div className="related-section">
          <div className="related-heading">
            <div>
              <span>FOR YOU</span>
              <h2>Related Products</h2>
            </div>

            <button onClick={() => navigate("/")}>View All</button>
          </div>

          <div className="related-grid">
            {related.map(item => (
              <div
                className="related-card"
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <div className="related-img">
                  <img
                    src={`https://fashionhub-tj47.onrender.com/uploads/${item.image}`}
                    alt={item.ClothName}
                  />
                </div>

                <div className="related-content">
                  <h3>{item.ClothName}</h3>
                  <span>{item.detail}</span>
                  <p>₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Contact />
      <About />
    </div>
  );
};

export default ProductDetail;

