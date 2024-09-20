import Users from "../models/Users.js";

class UsersController {
    async index(req, res, next) {
        const users = await Users.find({})
        res.json(users);
    }

    async create(req, res, next) {
        try {
            const isUserExist = await Users.findOne({ email: req.body.email })

            if (isUserExist) {
                return res.status(400).json({ message: "Người dùng đã tồn tại" }); // Thêm phản hồi
            }

            const user = await Users.create({
                email: req.body.email,
                displayName: req.body.displayName,
                username: req.body.email,
                password: req.body.email,
                photoURL: req.body.photoURL,
            });
            res.json(user);
        } catch (error) {
            next(error)
        }
    }

    // [GET] /users/email/:email
    async getUserByEmail(req, res, next) {
        try {
            const user = await Users.findOne({ email: req.params.email }) // Sửa thành findOne
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tìm thấy" }); // Thêm phản hồi nếu không tìm thấy
            }
            res.json(user);
        } catch (error) {
            next(error)
        }
    }

}

export default new UsersController();