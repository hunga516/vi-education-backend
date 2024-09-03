import Course from '../models/Course.js'; // Đổi extension sang .js nếu cần
import { mutipleMongooseToObject, singleMongooseToObject } from '../../utils/mongoose.js'; // Đổi extension sang .js nếu cần

class MeController {
    // [GET] /me/courses
    async meCourses(req, res, next) {

        let coursesQuery = Course.find({})


        if (req.query.hasOwnProperty('_sort')) {
            coursesQuery.sort({
                [req.query.column]: req.query.type //số - chữ HOA - chữ thường
            })
        }

        try {
            const [courses, deletedCount] = await Promise.all([
                coursesQuery,
                Course.countDocumentsWithDeleted({ deleted: true }) //plugin mongoose-soft-delete method
            ]);
            res.render('me/meCourses', {
                deletedCount,
                courses: mutipleMongooseToObject(courses)
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /me/courses/edit/:id
    async meEditCourse(req, res, next) {
        console.log(res.locals._sort);

        try {
            const course = await Course.findById({ _id: req.params.id }); //original method
            res.render('me/meEditCourse', {
                course: singleMongooseToObject(course)
            });
        } catch (error) {
            next(error);
        }
    }

    // [PUT] /me/courses/edit/store/:id
    async storeEditCourse(req, res, next) {
        try {
            await Course.updateOne({ _id: req.params.id }, req.body); //original method
            res.redirect('/me/courses');
        } catch (error) {
            next(error);
        }
    }

    // [DELETE] /me/courses/delete/:id
    async deleteCourse(req, res, next) {
        try {
            await Course.delete({ _id: req.params.id }); //plugin mongoose-soft-delete method
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }

    async trash(req, res, next) {
        try {
            const courses = await Course.findWithDeleted({ deleted: true }); //all course can use
            res.render('me/trashCourses', {
                courses: mutipleMongooseToObject(courses)
            });
        } catch (error) {
            next(error);
        }
    }

    async forceDeleteCourse(req, res, next) {
        try {
            await Course.deleteOne({ _id: req.params.id }); //original method
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            await Course.restore({ _id: req.params.id }); //plugin mongoose-soft-delete method
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }
}

export default new MeController();
