import mongoose, { Types } from 'mongoose';
import Posts from "../models/Posts/Posts.js";
import Comments from "../models/Posts/Comments.js";

class PostsController {

    // GET /posts
    async showAllPost(req, res, next) {
        try {
            const posts = await Posts.find({}).populate('author', 'username').populate('comments');
            res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    // GET /posts/comments
    async showAllComments(req, res, next) {
        try {
            const comments = await Comments.find({}).populate('post').populate('author').lean()
            res.json(comments)
        } catch (error) {
            next(error)

        }
    }

    // POST /posts/create-post
    async createPost(req, res, next) {
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

    // POST /posts/create-comment
    async createComment(req, res, next) {
        try {
            const comment = new Comments({
                content: req.body.content,
                author: new Types.ObjectId(req.body.author),
                post: new Types.ObjectId(req.body.postId)
            })

            await comment.save();
            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

}

export default new PostsController();