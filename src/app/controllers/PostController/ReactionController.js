import mongoose, { Types } from 'mongoose';
import Post from '../../models/Posts/Post.js';
import Reaction from '../../models/Posts/Reaction.js';

class ReactionController {

    // [GET] /reactions
    async getAllReactions(req, res, next) {
        const { post_id, limit = 0 } = req.query
        let query = {}
        if (post_id) {
            query.post = post_id
        }

        try {
            const reactions = await Reaction.find(query).limit(limit)

            res.json({
                post_id,
                reactions
            })
        } catch (error) {
            next(error)

        }
    }

    async getAllReactionsByPostId(req, res, next) {
        try {
            const countReactions = await Reaction.countDocuments({ post: req.params.id })
            const reactions = await Reaction.find({ post: req.params.id })
            res.json({
                reactions,
                countReactions
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /reactions
    async addReaction(req, res, next) {
        const { post_id, comment_id } = req.body

        try {
            let newReaction;
            if (post_id) {
                newReaction = new Reaction({
                    type: req.body.type,
                    author: req.body.author,
                    post: req.body.post_id
                });
            } else if (comment_id) {
                newReaction = new Reaction({
                    content: req.body.content,
                    author: req.body.author,
                    comment: req.body.comment_id
                });
            }


            await newReaction.save();

            res.json(newReaction);
        } catch (error) {
            next(error);
        }
    }

}

export default new ReactionController();