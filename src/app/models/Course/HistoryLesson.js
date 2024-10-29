import mongoose, { Schema } from 'mongoose';
import moment from 'moment';
import 'moment/locale/vi.js';

const HistoryLessonSchema = new mongoose.Schema({
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    updatedContent: { type: String },
    type: { type: String }, //import or export
    fileName: { type: String }, //name cua file csv
    size: { type: String } //size cua file csv
}, {
    timestamps: true,
});

HistoryLessonSchema.methods.toJSON = function () {
    const lesson = this.toObject();

    if (lesson.createdAt) {
        lesson.createdAt = moment(lesson.createdAt).fromNow();
    }
    if (lesson.updatedAt) {
        lesson.updatedAt = moment(lesson.updatedAt).fromNow();
    }
    return lesson;
};


export default mongoose.model('HistoryLesson', HistoryLessonSchema);
