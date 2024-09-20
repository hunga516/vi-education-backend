import { model, Schema } from "mongoose";

const CommentsSchema = new Schema({
    content: { type: String, required: true },

    //Reference
    post: { type: Schema.Types.ObjectId, ref: 'Posts', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
}, {
    timestamps: true
})

export default model('Comments', CommentsSchema)