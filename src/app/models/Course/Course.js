import mongoose, { Schema } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongooseDelete from 'mongoose-delete';
import mongooseSequence from 'mongoose-sequence';


const CourseSchema = new mongoose.Schema({
    courseId: { type: Number },
    role: { type: String },
    name: { type: String, default: "Default name" }, //default will enable if type === undefined
    description: { type: String, default: "Default description" },
    images: { type: String, default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC5V5g68dTYlES7tgY55eWdnJSChHU27m1kg&s" },
    chapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    author: { type: Schema.Types.ObjectId, ref: "Users" },
    slug: { type: String, slug: 'name', unique: true },
    deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});

// Add plugins
mongoose.plugin(slug);
const AutoIncrement = mongooseSequence(mongoose);
CourseSchema.plugin(AutoIncrement, { inc_field: 'courseId' });
CourseSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true
});

export default mongoose.model('Course', CourseSchema);
