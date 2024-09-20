import mongoose from 'mongoose';

async function Connect() {
    try {
        await mongoose.connect('mongodb+srv://hunga5160:hunga5160@cluster0.0uxnqct.mongodb.net/vi_education');
        console.log("Connect mongodb successfully!!");
    } catch (error) {
        console.log("Connect mongodb failed!!");
    }
}

export default Connect;
