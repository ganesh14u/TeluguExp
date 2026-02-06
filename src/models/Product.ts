import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        userName: String,
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
    },
    { timestamps: true }
);

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        images: [{ type: String }],
        image: { type: String },
        videoUrl: { type: String },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        sku: { type: String, unique: true, sparse: true },
        category: { type: String, required: true },
        tags: [{ type: String }],
        ratings: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        reviews: [ReviewSchema],
        isFeatured: { type: Boolean, default: false },
        isSeasonal: { type: Boolean, default: false },
        seasonalType: { type: String }, // e.g., "Diwali", "Summer"
        seoTitle: String,
        seoDescription: String,
    },
    { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;
