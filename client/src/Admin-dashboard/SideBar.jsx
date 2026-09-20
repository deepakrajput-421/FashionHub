import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import './SideBar.css'
import Navbar from '../component/navbar';
import axios from 'axios';

export const SideBar = () => {
    const navigate = useNavigate();
    const logoutAdmin = async () => {
        try {
            await axios.post(
                "https://fashionhub-tj47.onrender.com/admin/logout",
                {},
                { withCredentials: true }
            );

            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div>

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <div className="admin-logo">

                    <div className="admin-logo-icon">
                        F <span>H</span>
                    </div>

                    <div>
                        <h2>
                            Fashion<span>Hub</span>
                        </h2>

                        <p>ADMIN PANEL</p>
                    </div>

                </div>


                <div className="admin-menu-title">
                    MAIN MENU
                </div>


                {/* side navbar code */}

                <nav>

                    <Link to="/dashboard" className="admin-menu-item">
                        <span className="menu-icon">▦</span>
                        <span>Dashboard</span>
                    </Link>


                    <Link to="/manage-data" className="admin-menu-item">
                        <span className="menu-icon">▤</span>
                        <span>Manage Data</span>
                    </Link>


                    <Link to="/add-cloth" className="admin-menu-item">
                        <span className="menu-icon">+</span>
                        <span>Add Cloths</span>
                    </Link>


                    <Link to="/add-category" className="admin-menu-item">
                        <span className="menu-icon">+</span>
                        <span>Add Category</span>
                    </Link>
                    <Link to="/add-coupon" className="admin-menu-item">
                        <span className="menu-icon">+</span>
                        <span>Add Coupon</span>
                    </Link>
                    <Link to="/Banner" className="admin-menu-item">
                        <span className="menu-icon">+</span>
                        <span>Add Banner</span>
                     </Link>
                  <Link to="/order-status" className="admin-menu-item">
                        <span className="menu-icon">+</span>
                        <span>Order Status</span>
                    </Link>

                    <Link to="/users" className="admin-menu-item">
                        <span className="menu-icon">♙</span>
                        <span>Users</span>
                    </Link>

                </nav>


                <div className="admin-menu-title bottom-title">
                    SYSTEM
                </div>


                <button type="button" className="admin-menu-item logout " onClick={logoutAdmin}>
                    <span className="menu-icon">↪</span>
                    <span>Logout</span>
                </button>


                <div className="admin-user-card">

                    <div className="admin-user-avatar">
                        A
                    </div>

                    <div>
                        <strong>Admin User</strong>
                        <small>Administrator</small>
                    </div>

                    <span>•••</span>

                </div>

            </aside>

        </div>
    )
}

export default SideBar;
