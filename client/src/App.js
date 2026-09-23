import './App.css';
import {Routes, Route, BrowserRouter, Navigate} from "react-router-dom";
import {Home} from "./component/home.jsx";
import {Login} from './pages/login.jsx';
import {Dashboard} from './Admin-dashboard/Dashboard';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCloth from './Admin-dashboard/AddCloth';
import {Manage} from './Admin-dashboard/Manage.jsx';
import AddCategory from './Admin-dashboard/AddCategory.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CategoryData from './pages/CategoryData.jsx';
import UpdateData from './Admin-dashboard/UpdateData.jsx';
import Signup from './pages/Signup.jsx';
import Cart from './pages/Cart.jsx';
import AddBanner from './Admin-dashboard/AddBanner.jsx';
import axios from 'axios';
import {useEffect, useState} from 'react';
import AddCoupon from './Admin-dashboard/Coupon.jsx';
import Shop from './component/Shop.jsx';
import Checkout from './pages/CheckOut.jsx';
import Address from './pages/Address.jsx';
import Orders from './pages/Orders.jsx';
import OrderStatus from './Admin-dashboard/Orderstatus.jsx';
import Account from './component/Account.jsx';
import {AdminForgot} from './pages/AdminForgot.jsx';
import UserForgot from './pages/UserForgot.jsx';
import Wishlist from './pages/Wishlist.jsx';
import {ContactMessages} from './Admin-dashboard/ContactMessage.jsx';

function AdminProtectedRoute({children}) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(
          "https://fashionhub-tj47.onrender.com/admin/me",
          {withCredentials: true}
        );

        if (res.data.success === true) {
          setIsAdmin(true);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/add-cloth"
            element={
              <AdminProtectedRoute>
                <AddCloth />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/add-category"
            element={
              <AdminProtectedRoute>
                <AddCategory />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/add-coupon"
            element={
              <AdminProtectedRoute>
                <AddCoupon />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/manage-data"
            element={
              <AdminProtectedRoute>
                <Manage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/update/:id"
            element={
              <AdminProtectedRoute>
                <UpdateData />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/Banner"
            element={
              <AdminProtectedRoute>
                <AddBanner />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <AdminProtectedRoute>
                <ContactMessages />
              </AdminProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<AdminForgot />} />

          <Route
            path="/order-status"
            element={
              <AdminProtectedRoute>
                <OrderStatus />
              </AdminProtectedRoute>
            }
          />

          <Route path="/shop" element={<Shop />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/CatData/:gender/:category" element={<CategoryData />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/delivery-address" element={<Address />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/account" element={<Account />} />
          <Route path="/userforgot" element={<UserForgot />} />

        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
}

export default App;