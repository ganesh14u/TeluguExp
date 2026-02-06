import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String },
});

const OrderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        orderItems: [OrderItemSchema],
        shippingAddress: {
            name: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            zipCode: String,
        },
        paymentMethod: { type: String, default: "Razorpay" },
        paymentResult: {
            id: String,
            status: String,
            email_address: String,
        },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, required: true },
        taxPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        orderStatus: {
            type: String,
            enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
            default: "Processing",
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        trackingNumber: String,
        trackingUrl: String,
        couponCode: String,
        discountAmount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);
export default Order;
