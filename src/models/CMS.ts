import mongoose, { Schema, model, models } from "mongoose";

const CMSSchema = new Schema(
    {
        key: { type: String, required: true, unique: true }, // e.g., 'homepage'
        content: { type: Schema.Types.Mixed, required: true },
        lastUpdatedBy: String,
    },
    { timestamps: true }
);

export default models.CMS || model("CMS", CMSSchema);
