import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ["order_status", "general"], default: "order_status" },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
