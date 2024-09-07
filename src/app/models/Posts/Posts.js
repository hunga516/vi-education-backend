import { model, Schema } from "mongoose";

const PostsSchema = new Schema({
    topic: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
    status: { type: String, default: "Ðang mở" },
    // usersJoin: { type: Schema.Types.ObjectId, ref: 'users' },
    upvote: { type: Number, default: 0 },
    downvote: { type: Number, default: 0 }

}, {
    timestamps: true
})

export default model('Posts', PostsSchema)