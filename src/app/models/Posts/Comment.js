import { model, Schema } from "mongoose";
import moment from 'moment';
import 'moment/locale/vi.js';

const CommentSchema = new Schema({
    content: { type: String, required: true },
    media: { type: String },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true
})

CommentSchema.methods.toJSON = function () {
    const comment = this.toObject();

    if (comment.createdAt) {
        comment.createdAt = moment(comment.createdAt).fromNow();
    }
    if (comment.updatedAt) {
        comment.updatedAt = moment(comment.updatedAt).format('DD-MM-YYYY');
    }
    if (comment.deletedAt) {
        comment.deletedAt = moment(comment.deletedAt).format('DD-MM-YYYY');
    }

    return comment;
};

export default model('Comment', CommentSchema)