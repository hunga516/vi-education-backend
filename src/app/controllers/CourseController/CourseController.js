import Course from '../../models/Course/Course.js'; // Đổi extension sang .js nếu cần
import { mutipleMongooseToObject, singleMongooseToObject } from '../../../utils/mongoose.js'; // Đổi extension sang .js nếu cần

class CourseController {
    // [GET] /courses
    async getAllCourses(req, res, next) {
        try {
            const courses = await Course.find({}).populate('chapters').populate('author', 'displayName photoURL');
            console.log(courses);
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
            console.log(course);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/show-add-course
    showAddCourse(req, res) {
        res.render("courses/createCourse");
    }

    // [POST] /courses
    async addCourse(req, res, next, io) {
        try {
            const course = req.body;

            if (course.images === '') {
                course.images = undefined;
            }

            const newCourse = await Course.create(course);
            res.redirect('/me/courses');
        } catch (error) {
            next(error);
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
