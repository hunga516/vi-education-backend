import mongoose from 'mongoose';
import Posts from "../models/Posts.js";
import User from "../models/Users.js";  // Giả sử bạn có model User

class PostsController {
    async index(req, res, next) {
        try {
            const posts = await Posts.find({}).populate('author', 'username');
            res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            req.body.author = new mongoose.Types.ObjectId(req.body.author);

            const post = new Posts({
                ...req.body
            })

            await post.save()
            res.json(post);
        } catch (error) {
            next(error);
        }
    }
}

export default new PostsController();