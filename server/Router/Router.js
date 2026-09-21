
const express = require('express');
const router = express.Router();
const Logincontroller = require('../controller/logincontroller');
const { Addcontroller, GetData, DeleteData, UpdateData, NewData } = require('../controller/AddController');
const { CategoryController, GetCategory, DeleteCategory, GetCatData } = require('../controller/CategoryController');
const multer = require("multer");
const path = require('path');
const { GetProduct, GetProductByCategory } = require('../controller/ProductDetailController');
const SignupData = require('../controller/SignUpController');
const UserLoginData = require('../controller/UserLoginController');
const { AddBanner, GetBanner, DeleteBanner } = require('../controller/BannerController');
const authMiddleware = require('../Middleware/authmiddleware');
const adminMiddleware = require('../Middleware/adminmiddleware');
const { AddCoupon, ApplyCoupon, GetCoupons, DeleteCoupon } = require("../controller/CouponController");
const { GetCart, AddToCart, UpdateCart, RemoveFromCart, ClearCart } = require('../controller/CartController');
const { CreateOrder, GetOrders, CancelOrder } = require('../controller/OrderController');
const { GetAddress, SaveAddress, DeleteAddress } = require('../controller/AddressContoller');
const { UpdateOrderStatus, GetAllOrders } = require('../controller/AdminOrderContoller');
const { GetWishlist, ToggleWishlist, RemoveFromWishlist } = require('../controller/WishlistController');
const { AddContact, DeleteContact, GetContact } = require('../controller/ContactController');


// admin login route
router.post('/login', Logincontroller);
router.post('/admin/send-otp', Logincontroller.SendAdminOTP);
router.post('/admin/reset-password', Logincontroller.ResetAdminPassword);

router.get("/admin/me", adminMiddleware, (req, res) => {
    res.json({
        success: true,
        admin: req.admin
    });
});

router.post("/admin/logout", (req, res) => {
    res.clearCookie("adminToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

    res.json({
        success: true,
        message: "Admin logout successful"
    });
});


// coupon
router.post("/applycoupon", authMiddleware, ApplyCoupon);
router.post("/addcoupon", adminMiddleware, AddCoupon);
router.get("/getcoupons", adminMiddleware, GetCoupons);
router.delete("/deletecoupon/:id", adminMiddleware, DeleteCoupon);


// category routes
router.post('/AddCategory', adminMiddleware, CategoryController);
router.get('/getcategory', GetCategory);
router.delete("/deletecategory/:id", adminMiddleware, DeleteCategory);


// AddData routes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

router.get('/GetData', GetData);
router.post('/AddData', adminMiddleware, upload.single("image"), Addcontroller);
router.delete('/deletedata/:id', adminMiddleware, DeleteData);
router.get('/update/:id', adminMiddleware, UpdateData);
router.put('/NewData/:id', adminMiddleware, upload.single("image"), NewData);


// Getproduct routes
router.get("/getproduct/:id", GetProduct);
router.get("/getproductbycategory/:category", GetProductByCategory);
router.get("/CatData/:gender/:category", GetCatData);


// Signup and Login routes
router.post("/SignupData", SignupData);
router.post('/LoginData', UserLoginData);
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.json({
        success: true,
        message: "Logout successful"
    });
});
router.post("/SendOTP", SignupData.SendOTP);
router.post("/VerifyOTP", SignupData.VerifyOTP);

// User Forgot Password
router.post("/forgot-password/send-otp", SignupData.SendForgotOTP);
router.post("/forgot-password/reset-password", SignupData.ResetUserPassword);


// Banner routes
const Bstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/banner"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const Bupload = multer({
    storage: Bstorage
});

router.post("/addbanner", adminMiddleware, Bupload.single("image"), AddBanner);
router.delete("/deletebanner/:id", adminMiddleware, DeleteBanner);
router.get("/getbanner", GetBanner);


router.get("/test-auth", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Authentication working",
        user: req.user
    });
});


// cart routes
router.get("/cart", authMiddleware, GetCart);
router.post("/cart", authMiddleware, AddToCart);
router.put("/cart", authMiddleware, UpdateCart);
router.delete("/cart", authMiddleware, RemoveFromCart);
router.delete("/cart/clear", authMiddleware, ClearCart);


// address routes
router.get("/address", authMiddleware, GetAddress);
router.post("/address", authMiddleware, SaveAddress);
router.delete("/address", authMiddleware, DeleteAddress);


// order routes
router.post("/create-order", authMiddleware, CreateOrder);
router.get("/orders", authMiddleware, GetOrders);
router.patch(
    "/cancel-order/:orderId",
    authMiddleware,
    CancelOrder
);
// wishlist routes
router.get("/wishlist", authMiddleware, GetWishlist);
router.post("/wishlist/toggle", authMiddleware, ToggleWishlist);
router.delete("/wishlist/:productId", authMiddleware, RemoveFromWishlist);



// admin order routes
router.get("/admin/orders", adminMiddleware, GetAllOrders);
router.patch("/updateOrderStatus/:orderId", adminMiddleware, UpdateOrderStatus);

router.post("/contact", AddContact);
router.get("/getcontact", GetContact);
router.delete("/deletecontact/:id", DeleteContact);
module.exports = router;
