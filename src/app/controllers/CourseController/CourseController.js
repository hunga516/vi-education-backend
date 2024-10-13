import cloudinary from '../../../config/cloudinary/index.js';
import Course from '../../models/Course/Course.js';

class CourseController {
    // [GET] /courses
    async getAllCourses(req, res, next) {
        const { _id, sort, order, title, description, author, page = 1 } = req.query
        const skip = (page - 1) * 10 //number of limit is 10

        let query = { isDeleted: false }
        if (title) {
            query.title = new RegExp(title, 'i');
        }
        if (description) {
            query.description = description;
        }
        if (_id) {
            query._id = _id
        } 3
        if (author) {
            query.author = author
        }


        try {
            const courses = await Course.find(query).skip(skip).limit(10).populate('author', 'displayName photoURL email').sort({ [sort]: order || -1 })
            const totalCourses = await Course.find(query).countDocuments()
            res.json({
                courses,
                totalCourses
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/count
    async countAllCourses(req, res, next) {
        try {
            const totalCourses = await Course.countDocuments()
            res.json(totalCourses);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/trash
    async getAllTrashCourses(req, res, next) {
        try {
            const courses = await Course.find({ isDeleted: true }).sort({ deletedAt: -1 }).populate('author', 'displayName photoURL');
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/:id
    async getCourseByCourseId(req, res, next) {
        try {
            const course = await Course.findOne({ _id: req.params.id }).populate('author', 'displayName photoURL email');
            res.json(course)
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/show-add-course
    showAddCourse(req, res) {
        res.render("courses/createCourse");
    }

    // [POST] /courses
    async addCourse(req, res, next) {
        try {
            const { title, description, author, content, role } = req.body;
            let imageUrl;

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                });
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const newCourse = new Course({
                title,
                description,
                author,
                content,
                role,
                images: imageUrl || '',
            });

            await newCourse.save();

            const savedCourse = await Course.findById(newCourse._id).populate('author', 'displayName photoURL')

            req.io.emit('course_added', savedCourse);
            res.json(newCourse);
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /courses/:id
    async softDeleteCourse(req, res, next) {
        try {
            const courseDeleted = await Course.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: true,
                deletedBy: req.body.userId,
                deletedAt: new Date()
            })

            req.io.emit('course_soft_deleted', courseDeleted)
            res.json(courseDeleted)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /courses/restore/:id
    async restoreCourse(req, res, next) {
        try {
            const courseRestored = await Course.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: false,
                deletedAt: null,
                deletedBy: null
            })

            req.io.emit('course_restored', courseRestored)
            res.json(courseRestored)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /courses/:id
    async editCourse(req, res, next) {
        try {
            const response = await Course.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }).populate('author')
            req.io.emit('course_edited', response)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    async handleFormAction(req, res, next) {
        try {
            switch (req.body.action) {
                case 'soft-delete':
                    await Course.updateMany({ _id: { $in: req.body.courseIds } }, {
                        isDeleted: true,
                        deletedBy: req.body.userId,
                        deletedAt: new Date()
                    });

                    const courseDeleteds = await Course.find({ _id: { $in: req.body.courseIds } })
                    req.io.emit('course_soft_deleted', courseDeleteds)
                    break;
                case 'restore':
                    await Course.updateMany({ _id: { $in: req.body.courseIds } }, {
                        isDeleted: false,
                        deletedAt: null,
                        deletedBy: null
                    });
                    const courseRestoreds = await Course.find({ _id: { $in: req.body.courseIds } })
                    req.io.emit('course_restored', courseRestoreds)
                    break;
                case 'forceDelete':
                    await Course.deleteMany({ _id: { $in: req.body.courseIds } });
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

export default new CourseController();
