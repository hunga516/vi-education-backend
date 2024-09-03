import Users from "../models/Users.js";

class UsersController {
    async index(req, res, next) {
        const users = await Users.find({})
        res.json(users);
    }

    async create(req, res, next) {
        const user = await Users.create(req.body);
        res.json(user);
    }

}

export default new UsersController();