import mongoose, { Types } from 'mongoose';
import Posts from "../../models/Posts/Posts.js";
import Comments from "../../models/Posts/Comments.js";

class ClassController {

    // [GET] /posts/comments
    async getAllComments(req, res, next) {
        try {
            const comments = await Comments.find({}).populate('post').populate('author').lean()
            res.json(comments)
        } catch (error) {
            next(error)

        }
    }

    // [POST] /posts/:id/comment
    async addComment(req, res, next) {
        try {
            const comment = new Comments({
                content: req.body.content,
                author: new Types.ObjectId(req.body.author),
                post: new Types.ObjectId(req.body.post)
            });

            await comment.save();

            // Cập nhật bài viết để thêm ID của bình luận vào mảng comments
            await Posts.findByIdAndUpdate(req.body.post, { $push: { comments: comment._id } });

            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

    async getCommentsByPostId(req, res, next) {
        try {
            const post = await Posts.findById(req.params.postId).populate('comments')
            res.status(200).json(post.comments)
        } catch (error) {
            next(error)
        }
    }

}

export default new ClassController();