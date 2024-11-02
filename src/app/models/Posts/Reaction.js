import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseSequence from 'mongoose-sequence';
import moment from 'moment';

const ReactionSchema = new mongoose.Schema({
    type: { type: String },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    author: { type: Schema.Types.ObjectId, ref: "Users" },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

ReactionSchema.methods.toJSON = function () {
    const reaction = this.toObject();

    if (reaction.createdAt) {
        reaction.createdAt = moment(reaction.createdAt).format('DD-MM-YYYY');
    }
    if (reaction.updatedAt) {
        reaction.updatedAt = moment(reaction.updatedAt).format('DD-MM-YYYY');
    }
    if (reaction.deletedAt) {
        reaction.deletedAt = moment(reaction.deletedAt).format('DD-MM-YYYY');
    }

    return reaction;
};

// Auto incre
const AutoIncrement = mongooseSequence(mongoose);
ReactionSchema.plugin(AutoIncrement, { inc_field: 'reactionId' });

export default mongoose.model('Reaction', ReactionSchema);
