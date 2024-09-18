import Chapters from '../../models/Course/Chapter.js'; // Đổi extension sang .js nếu cần
import { mutipleMongooseToObject, singleMongooseToObject } from '../../../utils/mongoose.js'; // Đổi extension sang .js nếu cần
import Chapter from '../../models/Course/Chapter.js';
import Course from '../../models/Course/Course.js';

class ChapterController {
    // [GET] /courses/chapters
    async index(req, res, next) {
        try {
            // Lấy danh sách chapter
            const chapters = await Chapters.find({});

            // Lấy danh sách các course tương ứng với courseId trong chapters
            const courseIds = chapters.map(chapter => chapter.course); // Lấy danh sách courseId
            const courses = await Course.find({ courseId: { $in: courseIds } }); // Tìm các course tương ứng

            // Gắn thông tin course vào chapter
            const chaptersWithCourses = chapters.map(chapter => ({
                ...chapter.toObject(),
                course: courses.find(course => course.courseId === chapter.course), // Tham chiếu qua courseId
            }));

            res.json(chaptersWithCourses);
        } catch (error) {
            next(error);
        }
    }


    // [GET] /chapters/create
    create(req, res) {
        res.render("courses/createCourse");
    }

    // [POST] /course/chapter/store
    async store(req, res, next) {
        try {
            const chapter = req.body;

            const newChapter = new Chapter({
                course: Number(chapter.course),
                ...chapter
            })

            newChapter.save()

            res.json(chapter)
        } catch (error) {
            // await session.abortTransaction()
            next(error);
        } finally {
            // session.endSession()
        }
    }

    // [GET] /courses/:slug
    async detail(req, res, next) {
        try {
            const course = await Courses.findOne({ slug: req.params.slug });
            res.render('courses/detailCourse', { course: singleMongooseToObject(course) });
            console.log(course);
        } catch (error) {
            next(error);
        }
    }

}

export default new ChapterController();
