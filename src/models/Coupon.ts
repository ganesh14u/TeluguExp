import mongoose, { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
    {
        code: { type: String, required: true, unique: true },
        discountType: { type: String, enum: ["Percentage", "Flat", "Shipping"], required: true },
        discountValue: { type: Number, required: true },
        expiryDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        usedCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default models.Coupon || model("Coupon", CouponSchema);
