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
        const { sort = "_id", order, email, username, displayName, page = 1 } = req.query
        const skip = (page - 1) * 10

        const query = { isDeleted: false }
        if (email) {
            query.email = new RegExp(email, 'i')
        }
        if (username) {
            query.username = new RegExp(username, 'i')
        }
        if (displayName) {
            query.displayName = new RegExp(displayName, 'i')
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

    async getUsersTrash(req, res, next) {
        const { page = 1 } = req.query
        const skip = (page - 1) * 10

        try {
            const users = await Users.find({ isDeleted: true }).skip(skip).limit(10).sort({ deletedAt: -1 })
            const totalUsers = await Users.find({ isDeleted: true }).countDocuments()

            res.json({
                users,
                totalUsers
            })
        } catch (error) {
            next(error)
        }
    }

    async softDeleteUser(req, res, next) {
        try {
            const user = await Users.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: true,
                deletedBy: req.body.userId,
                deletedAt: new Date()
            })

            req.io.emit('user:soft-delete', user)
            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    async restoreUser(req, res, next) {
        try {
            const user = await Users.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: false,
                deletedAt: null,
                deletedBy: null
            })

            req.io.emit('user:restore', user)
            res.json(user)

        } catch (error) {
            next(error)
        }
    }

    async handleFormAction(req, res, next) {
        try {
            switch (req.body.action) {
                case 'soft-delete':
                    await Users.updateMany({ _id: { $in: req.body.userIds } }, {
                        isDeleted: true,
                        deletedBy: req.body.userId,
                        deletedAt: new Date()
                    });

                    const userDeleteds = await Users.find({ _id: { $in: req.body.userIds } })
                    console.log(userDeleteds);
                    req.io.emit('user:soft-delete', userDeleteds)
                    break;
                case 'restore':
                    await Users.updateMany({ _id: { $in: req.body.userIds } }, {
                        isDeleted: false,
                        deletedAt: null,
                        deletedBy: null
                    });
                    const userRestoreds = await Users.find({ _id: { $in: req.body.userIds } })
                    req.io.emit('user:restore', userRestoreds)
                    break;
                case 'forceDelete':
                    await Users.deleteMany({ _id: { $in: req.body.userIds } });
                    res.redirect('back');
                    break;
                default:
                    res.json('Invalid action!!!');
                    break;
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController
