import mongoose, { Types } from 'mongoose';
import Posts from "../../models/Posts/Posts.js";
import Comments from "../../models/Posts/Comments.js";

class PostsController {

    // [GET] /posts
    async getAllPosts(req, res, next) {
        try {
            const posts = await Posts.find({}).populate('author', 'username').populate({ path: 'comments', populate: { path: 'author' } });
            res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /posts/:postId
    async getPostByPostId(req, res, next) {
        try {
            const post = await Posts.findById(req.params.postId)
            res.json(post);
        } catch (error) {
            next(error);
        }
    }

    // [POST] /posts
    async addPost(req, res, next) {
        try {
            req.body.author = new mongoose.Types.ObjectId(req.body.author); //performance

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