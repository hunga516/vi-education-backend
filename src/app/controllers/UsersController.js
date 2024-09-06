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
                return
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

}

export default new UsersController();