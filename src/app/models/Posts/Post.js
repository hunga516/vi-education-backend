import mongoose, { Schema } from 'mongoose';
import mongooseSequence from 'mongoose-sequence';
import moment from 'moment';
import 'moment/locale/vi.js';


const PostSchema = new mongoose.Schema({
    postId: { type: Number },
    media: { type: String },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    likes: { type: Schema.Types.ObjectId, ref: 'Like' },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

PostSchema.methods.toJSON = function () {
    const post = this.toObject();

    if (post.createdAt) {
        post.createdAt = moment(post.createdAt).fromNow();
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
PostSchema.plugin(AutoIncrement, { inc_field: 'postId' });

export default mongoose.model('Post', PostSchema);
