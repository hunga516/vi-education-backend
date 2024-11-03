import mongoose, { Types } from 'mongoose';
import Comment from '../../models/Posts/Comment.js';
import Post from '../../models/Posts/Post.js';
import Room from '../../models/Message/Room.js';

class RoomController {

    // [GET] /rooms
    async getAllRooms(req, res, next) {
        const { title } = req.query
        let query = {}
        if (title) {
            query.post = title
        }

        try {
            const rooms = await Room.find(query).populate('members')
            res.json(rooms)
        } catch (error) {
            next(error)

        }
    }

    // [POST] /rooms
    async addRoom(req, res, next) {
        const { title, member } = req.body
        try {
            // const members = Room.findOne({ title })

            const newRoom = new Room({
                title,
                members: member
            });
            await newRoom.save();

            res.json(newRoom);
        } catch (error) {
            next(error);
        }
    }

}

export default new RoomController();