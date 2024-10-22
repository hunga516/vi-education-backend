import moment from "moment";
import { model, Schema } from "mongoose";

const UsersSchema = new Schema({
    displayName: { type: String },
    username: { type: String },
    password: { type: String },
    photoURL: { type: String },
    email: { type: String, required: true },
    role: { type: String, default: "user" },
    followCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    deletedReason: { type: String },
    deletedAt: { type: Date },
    online: { type: Boolean }
}, {
    timestamps: true
})

UsersSchema.methods.toJSON = function () {
    const user = this.toObject();

    if (user.createdAt) {
        user.createdAt = moment(user.createdAt).format('DD-MM-YYYY');
    }
    if (user.updatedAt) {
        user.updatedAt = moment(user.updatedAt).format('DD-MM-YYYY');
    }
    if (user.deletedAt) {
        user.deletedAt = moment(user.deletedAt).format('DD-MM-YYYY');
    }

    return user;
};

export default model('Users', UsersSchema)