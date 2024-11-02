import mongoose, { Types } from 'mongoose';
import Comment from '../../models/Posts/Comment.js';
import Post from '../../models/Posts/Post.js';

class CommentController {

    // [GET] /comments
    async getAllComments(req, res, next) {
        const { post_id, limit = 0 } = req.query
        let query = {}
        if (post_id) {
            query.post = post_id
        }

        try {
            const comments = await Comment.find(query).populate('post').populate('author').limit(limit)
            res.json({
                post_id,
                comments
            })
        } catch (error) {
            next(error)

        }
    }

    // [POST] /comments
    async addComment(req, res, next) {
        try {
            const newComment = new Comment({
                content: req.body.content,
                author: req.body.author,
                post: req.body.post_id
            });
            await newComment.save();

            res.json(newComment);
        } catch (error) {
            next(error);
        }
    }

}

export default new CommentController();