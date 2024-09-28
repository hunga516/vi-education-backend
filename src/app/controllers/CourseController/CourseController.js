import Course from '../../models/Course/Course.js'; // Đổi extension sang .js nếu cần
import { mutipleMongooseToObject, singleMongooseToObject } from '../../../utils/mongoose.js'; // Đổi extension sang .js nếu cần
import { query } from 'express';

class CourseController {
    // [GET] /courses
    async getAllCourses(req, res, next) {
        try {
            const { sort, order, title, description } = req.query

            let query = { isDeleted: false }
            if (title) {
                query.title = new RegExp(title, 'i');
            }
            if (description) {
                query.description = description;
            }

            const courses = await Course.find(query).populate('chapters').populate('author', 'displayName photoURL').sort({ [sort]: order || -1 })
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/trash
    async getAllTrashCourses(req, res, next) {
        try {
            const courses = await Course.find({ isDeleted: true }).populate('chapters').populate('author', 'displayName photoURL');
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/:courseId
    async getCourseByCourseId(req, res, next) {
        try {
            const course = await Course.findOne({ courseId: req.params.courseId });
            res.render('courses/detailCourse', { course: singleMongooseToObject(course) });
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
            const course = req.body;

            if (course.images === '') {
                course.images = undefined;
            }

            const newCourse = new Course(course)
            await newCourse.save() //xem lai khuc nay, co can asign savedCourse khong

            const savedCourse = await Course.findById(newCourse._id).populate('author', 'displayName photoURL');
            req.io.emit('course_added', savedCourse);
            res.json(newCourse)
        } catch (error) {
            next(error);
        } finally {
        }
    }

    //[DELETE] /courses/:courseId
    async softDeleteCourse(req, res, next) {
        try {
            const courseDeleted = await Course.findOneAndUpdate({ courseId: req.params.courseId }, {
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

    // [POST] /courses/restore/:courseId
    async restoreCourse(req, res, next) {
        try {
            const courseRestored = await Course.findOneAndUpdate({ courseId: req.params.courseId }, {
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

    // [PUT] /courses/:courseId
    async editCourse(req, res, next) {
        try {
            const response = await Course.findOneAndUpdate({ courseId: req.params.courseId }, req.body, { new: true }).populate('author')
            req.io.emit('course_edited', response)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    async handleFormAction(req, res, next) {
        try {
            switch (req.body.action) {
                case 'delete':
                    await Course.delete({ _id: { $in: req.body.courseIds } });
                    res.redirect('back');
                    break;
                case 'restore':
                    await Course.restore({ _id: { $in: req.body.courseIds } });
                    res.redirect('back');
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
