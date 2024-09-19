import Course from '../../models/Course/Course.js'; // Đổi extension sang .js nếu cần
import { mutipleMongooseToObject, singleMongooseToObject } from '../../../utils/mongoose.js'; // Đổi extension sang .js nếu cần

class CourseController {
    // [GET] /courses
    async getAllCourses(req, res, next) {
        try {
            const courses = await Course.find({}).populate('chapter');
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /courses/:courseId
    async getCourseByCourseId(req, res, next) {
        try {
            const course = await Course.findOne({ slug: req.params.courseId });
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
    async addCourse(req, res, next) {
        // const session = await mongoose.startSession()
        // session.startTransaction()

        try {
            const course = req.body;

            if (course.images === '') {
                course.images = undefined;
            }

            // const newCourse = await Course.create([course], { session });
            const newCourse = await Course.create(course);
            // await session.commitTransaction()
            res.redirect('/me/courses');
        } catch (error) {
            // await session.abortTransaction()
            next(error);
        } finally {
            // session.endSession()
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
