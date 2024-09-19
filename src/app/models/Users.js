import { model, Schema } from "mongoose";

const UsersSchema = new Schema({
    displayName: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    photoURL: { type: String },
    email: { type: String, required: true },
    role: { type: String, default: "user" }
}, {
    timestamps: true
})

export default model('Users', UsersSchema)