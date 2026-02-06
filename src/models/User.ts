import mongoose, { Schema, model, models } from "mongoose";

const AddressSchema = new Schema({
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    isDefault: { type: Boolean, default: false },
});

const CartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    price: Number,
    discountPrice: Number,
    quantity: { type: Number, default: 1 }
});

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        password: { type: String }, // Optional for Google OAuth users
        image: { type: String },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        addresses: [AddressSchema],
        wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        cart: [CartItemSchema],
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
