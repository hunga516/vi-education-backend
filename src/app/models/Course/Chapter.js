import mongoose, { Schema } from "mongoose";
import mongooseSequence from 'mongoose-sequence';


const ChapterSchema = new mongoose.Schema({
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    title: { type: String },
    description: { type: String },
    lessons: [{ type: Number, ref: "Lessons" }]
});


//Plugins
const AutoIncrement = mongooseSequence(mongoose);
ChapterSchema.plugin(AutoIncrement, { inc_field: 'chapterId' });

export default mongoose.model('Chapter', ChapterSchema)