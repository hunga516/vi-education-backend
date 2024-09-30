import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseSequence from 'mongoose-sequence';
import moment from 'moment';

const CourseSchema = new mongoose.Schema({
    courseId: { type: Number },
    role: { type: String, default: 'User' },
    title: { type: String, default: 'Default title' }, //default will enable if type === undefined
    description: { type: String, default: 'Default description' },
    images: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC5V5g68dTYlES7tgY55eWdnJSChHU27m1kg&s' },
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    slug: { type: String, slug: 'title', parse: true },
    registrationCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

CourseSchema.methods.toJSON = function () {
    const course = this.toObject();

    if (course.createdAt) {
        course.createdAt = moment(course.createdAt).format('DD-MM-YYYY');
    }
    if (course.updatedAt) {
        course.updatedAt = moment(course.updatedAt).format('DD-MM-YYYY');
    }
    if (course.deletedAt) {
        course.deletedAt = moment(course.deletedAt).format('DD-MM-YYYY');
    }

    return course;
};

CourseSchema.virtual('chapter', {
    ref: 'Chapter',
    localField: 'courseId', // Sử dụng courseId
    foreignField: 'courseId', // Trường trong Chapter tham chiếu đến
});
// Generate slug
mongoose.plugin(slug);

// Auto incre
const AutoIncrement = mongooseSequence(mongoose);
CourseSchema.plugin(AutoIncrement, { inc_field: 'courseId' });

export default mongoose.model('Course', CourseSchema);
