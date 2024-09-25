import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseSequence from 'mongoose-sequence';


const CourseSchema = new mongoose.Schema({
    courseId: { type: Number },
    role: { type: String, default: 'User' },
    title: { type: String, default: 'Default title' }, //default will enable if type === undefined
    description: { type: String, default: 'Default description' },
    images: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC5V5g68dTYlES7tgY55eWdnJSChHU27m1kg&s' },
    chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    slug: { type: String, slug: 'title', parse: true },
    registrationCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedReason: { type: String },
    deletedAt: { type: Date }
}, {
    timestamps: true,
});

// Generate slug
mongoose.plugin(slug);
// Auto incre
const AutoIncrement = mongooseSequence(mongoose);
CourseSchema.plugin(AutoIncrement, { inc_field: 'courseId' });

export default mongoose.model('Course', CourseSchema);
