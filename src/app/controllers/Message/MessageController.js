import mongoose, { Types } from 'mongoose';
import Comment from '../../models/Posts/Comment.js';
import Post from '../../models/Posts/Post.js';
import Message from '../../models/Message/Message.js';
import { MdOutlineIntegrationInstructions } from 'react-icons/md';

class MessageController {

    // [GET] /messages
    async getAllMessages(req, res, next) {
        const { room_id } = req.query
        let query = {}
        if (room_id) {
            query.room = room_id
        }

        try {
            const messages = await Message.find(query).populate('author')
            res.json({ messages })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /messages
    async addMessage(req, res, next) {
        try {
            const newMessage = new Message({
                content: req.body.content,
                author: req.body.author,
                room: req.body.room
            });
            await newMessage.save();

            const savedMessage = await Message.findOne({ _id: newMessage._id }).populate('author')
            res.json(savedMessage);
            req.io.emit('message:create', savedMessage)
        } catch (error) {
            next(error);
        }
    }

}

export default new MessageController();