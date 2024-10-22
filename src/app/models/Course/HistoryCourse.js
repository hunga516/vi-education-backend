import mongoose, { Schema } from 'mongoose';
import moment from 'moment';
import 'moment/locale/vi.js';

const HistoryCourseSchema = new mongoose.Schema({
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    updatedContent: { type: String },
}, {
    timestamps: true,
});

HistoryCourseSchema.methods.toJSON = function () {
    const course = this.toObject();

    if (course.createdAt) {
        course.createdAt = moment(course.createdAt).fromNow();
    }
    if (course.updatedAt) {
        course.updatedAt = moment(course.updatedAt).fromNow();
    }
    return course;
};


export default mongoose.model('HistoryCourse', HistoryCourseSchema);
