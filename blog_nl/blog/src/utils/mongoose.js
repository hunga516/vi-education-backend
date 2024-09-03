export function mutipleMongooseToObject(mongooses) {
    return mongooses.map(item => item.toObject());
}

export function singleMongooseToObject(mongoose) {
    return mongoose ? mongoose.toObject() : mongoose;
}
