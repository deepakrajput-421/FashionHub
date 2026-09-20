const OrderModel = require("../model/OrderModel");

const GetAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel
            .find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.log("Get All Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get all orders"
        });
    }
};

const UpdateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const allowedStatus = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatus.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const currentStatus = order.orderStatus;

        // Cancelled order cannot be changed
        if (currentStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled order status cannot be changed"
            });
        }

        // Shipped order cannot be cancelled
        if (
            currentStatus === "shipped" &&
            orderStatus === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipped order cannot be cancelled"
            });
        }

        // Delivered order cannot be cancelled
        if (
            currentStatus === "delivered" &&
            orderStatus === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivered order cannot be cancelled"
            });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    orderStatus
                }
            },
            {
                returnDocument: "after",
                runValidators: false
            }
        );

        res.json({
            success: true,
            message: "Order status updated",
            order: updatedOrder
        });

    } catch (error) {
        console.log("Update Status Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    GetAllOrders,
    UpdateOrderStatus
};