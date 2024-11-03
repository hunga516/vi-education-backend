import mongoose, { Schema } from 'mongoose';
import moment from 'moment';
import 'moment/locale/vi.js';

const MessageSchema = new mongoose.Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
    content: { type: String },
}, {
    timestamps: true,
});

MessageSchema.methods.toJSON = function () {
    const message = this.toObject();

    if (message.createdAt) {
        message.createdAt = moment(message.createdAt).fromNow();
    }
    if (message.updatedAt) {
        message.updatedAt = moment(message.updatedAt).fromNow();
    }
    return message;
};


export default mongoose.model('Message', MessageSchema);
