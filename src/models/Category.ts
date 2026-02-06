import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: String,
        image: String,
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    },
    { timestamps: true }
);

export default models.Category || model("Category", CategorySchema);
