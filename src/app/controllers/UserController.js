import Users from "../models/Users.js"

class UserController {
    async signUp(req, res, next) {
        const { username, password, displayName, email, photoURL } = req.body

        try {
            const exsitUser = await Users.findOne({ email })
            if (!!exsitUser) {
                return res.status(409).json({ message: "Tai khoan da ton tai truoc do" })
            }
            const newUser = new Users({
                username: username || displayName,
                password,
                photoURL,
                displayName,
                email
            })

            newUser.save()

            res.json({ message: "Dang ky user moi thanh cong" })
        } catch (error) {
            next(error)
        }
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body
            console.log(req.body);

            const user = await Users.findOne({ email, password })
            if (!user) {
                return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" })
            }
            res.status(200).json({ message: "Đăng nhập thành công", user })
        } catch (error) {
            next(error)
        }
    }

    async getAllUsers(req, res, next) {
        const { sort = "_id", order, email, page = 1 } = req.query
        const skip = (page - 1) * 10

        const query = { isDeleted: false }
        if (email) {
            query.email = new RegExp(email, 'i')
        }
        try {
            const users = await Users.find(query).skip(skip).limit(10).sort({ [sort]: order || -1 })
            const totalUsers = await Users.find(query).countDocuments()
            res.json({
                users,
                totalUsers
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await Users.findById(req.params.id)
            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    async getUserByEmail(req, res, next) {
        const { email } = req.params;
        try {
            const user = await Users.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng với email này" }); // Thông báo nếu không tìm thấy
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async editUser(req, res, next) {
        try {
            const userEdited = await Users.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
            req.io.emit('user:update', userEdited)
            res.json(userEdited)
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController
