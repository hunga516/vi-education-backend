import Course from '../models/Course.js'; // Đổi extension sang .js nếu cần
import { mutipleMongooseToObject, singleMongooseToObject } from '../../utils/mongoose.js';

class SiteController {
    async index(req, res, next) {
        try {
            const courses = await Course.find({});
            const transformedCourses = mutipleMongooseToObject(courses);
            res.render("home", { courses: transformedCourses });
        } catch (error) {
            next(error);
        }
    }

    search(req, res) {
        res.render('search');
    }
}

export default new SiteController();
