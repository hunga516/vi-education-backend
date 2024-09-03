import { model, Schema } from "mongoose";

const UsersSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: "user" }
}, {
    timestamps: true
})

export default model('Users', UsersSchema)