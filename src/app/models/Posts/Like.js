import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseSequence from 'mongoose-sequence';
import moment from 'moment';

const LikeSchema = new mongoose.Schema({
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    author: { type: Schema.Types.ObjectId, ref: "Users" },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

LikeSchema.methods.toJSON = function () {
    const post = this.toObject();

    if (post.createdAt) {
        post.createdAt = moment(post.createdAt).format('DD-MM-YYYY');
    }
    if (post.updatedAt) {
        post.updatedAt = moment(post.updatedAt).format('DD-MM-YYYY');
    }
    if (post.deletedAt) {
        post.deletedAt = moment(post.deletedAt).format('DD-MM-YYYY');
    }

    return post;
};

// Auto incre
const AutoIncrement = mongooseSequence(mongoose);
LikeSchema.plugin(AutoIncrement, { inc_field: 'postId' });

export default mongoose.model('Like', LikeSchema);
