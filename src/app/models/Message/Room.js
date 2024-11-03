import mongoose, { Schema } from 'mongoose';
import moment from 'moment';
import 'moment/locale/vi.js';

const RoomSchema = new mongoose.Schema({
    title: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
}, {
    timestamps: true,
});

RoomSchema.methods.toJSON = function () {
    const room = this.toObject();

    if (room.createdAt) {
        room.createdAt = moment(room.createdAt).fromNow();
    }
    if (room.updatedAt) {
        room.updatedAt = moment(room.updatedAt).fromNow();
    }
    return room;
};


export default mongoose.model('Room', RoomSchema);
