import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseSequence from 'mongoose-sequence';
import moment from 'moment';

const LessonSchema = new mongoose.Schema({
    lessonId: { type: Number },
    title: { type: String, default: 'Default title' },
    description: { type: String, default: 'Default description' },
    images: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC5V5g68dTYlES7tgY55eWdnJSChHU27m1kg&s' },
    video: { type: String },
    content: { type: String },
    slug: { type: String, slug: 'title', parse: true },
    learnCount: { type: Number, default: 0 },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

LessonSchema.methods.toJSON = function () {
    const lesson = this.toObject();

    if (lesson.createdAt) {
        lesson.createdAt = moment(lesson.createdAt).format('DD-MM-YYYY');
    }
    if (lesson.updatedAt) {
        lesson.updatedAt = moment(lesson.updatedAt).format('DD-MM-YYYY');
    }
    if (lesson.deletedAt) {
        lesson.deletedAt = moment(lesson.deletedAt).format('DD-MM-YYYY');
    }

    return lesson;
};

// Generate slug
mongoose.plugin(slug);

// Auto incre
const AutoIncrement = mongooseSequence(mongoose);
LessonSchema.plugin(AutoIncrement, { inc_field: 'lessonId' });

export default mongoose.model('Lesson', LessonSchema);
