import mongoose, { Schema } from 'mongoose';
import moment from 'moment';
import 'moment/locale/vi.js';

const TakeNoteSchema = new mongoose.Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    content: { type: String },
}, {
    timestamps: true,
});

TakeNoteSchema.methods.toJSON = function () {
    const course = this.toObject();

    if (course.createdAt) {
        course.createdAt = moment(course.createdAt).fromNow();
    }
    if (course.updatedAt) {
        course.updatedAt = moment(course.updatedAt).fromNow();
    }
    return course;
};


export default mongoose.model('TakeNote', TakeNoteSchema);
