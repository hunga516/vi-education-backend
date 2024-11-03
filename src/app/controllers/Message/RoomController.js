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
        const { title, members } = req.body; // Đổi 'member' thành 'members' cho nhất quán

        try {
            // Kiểm tra xem 'members' có phải là mảng không
            if (!Array.isArray(members)) {
                return res.status(400).json({ message: "Members must be an array of user IDs." });
            }

            const newRoom = new Room({
                title,
                members // sử dụng 'members' là mảng chứa ObjectId
            });

            await newRoom.save();

            res.json(newRoom);
        } catch (error) {
            next(error);
        }
    }
}

export default new RoomController();