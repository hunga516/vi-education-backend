import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseSequence from 'mongoose-sequence';
import moment from 'moment';

const ChapterSchema = new mongoose.Schema({
    title: { type: String, default: 'Default title' },
    description: { type: String, default: 'Default description' },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

ChapterSchema.methods.toJSON = function () {
    const chapter = this.toObject();

    if (chapter.createdAt) {
        chapter.createdAt = moment(chapter.createdAt).format('DD-MM-YYYY');
    }
    if (chapter.updatedAt) {
        chapter.updatedAt = moment(chapter.updatedAt).format('DD-MM-YYYY');
    }
    if (chapter.deletedAt) {
        chapter.deletedAt = moment(chapter.deletedAt).format('DD-MM-YYYY');
    }

    return chapter;
};

export default mongoose.model('Chapter', ChapterSchema);
