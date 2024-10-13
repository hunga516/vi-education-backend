import cloudinary from '../../../config/cloudinary/index.js';
import Course from '../../models/Course/Course.js';
import Lesson from '../../models/Course/Lesson.js';

class CourseController {
    // [GET] /lessons
    async getAllLessons(req, res, next) {
        const { _id, sort = "lesson", order, title, description, page = 1 } = req.query
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
        }

        try {
            const lessons = await Lesson.find(query)
                .skip(skip)
                .limit(10)
                .populate({
                    path: 'course',
                    select: 'images title',
                    populate: {
                        path: 'author',
                        select: 'displayName photoURL'
                    }
                })
            const totalLessons = await Lesson.find(query).countDocuments()
            res.json({
                lessons,
                totalLessons
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /lessons/count
    async countAllLessons(req, res, next) {
        try {
            const totalLessons = await Lesson.countDocuments()
            res.json(totalLessons);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /lessons/trash
    async getAllTrashLessons(req, res, next) {
        const { page = 1 } = req.query
        const skip = (page - 1) * 10

        try {
            const lessons = await Lesson.find({ isDeleted: true }).skip(skip).limit(10).sort({ deletedAt: -1 }).populate('course', 'images');
            const totalLessonsDeleted = await Lesson.find({ isDeleted: true }).countDocuments()
            res.json({
                lessons,
                totalLessonsDeleted
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /lessons/:id
    async getLessonByLessonId(req, res, next) {
        try {
            const lesson = await Lesson.findOne({ _id: req.params.id }).populate('course', 'images');
            res.json(lesson)
        } catch (error) {
            next(error);
        }
    }

    // [POST] /lessons
    async addLesson(req, res, next) {
        try {
            const { title, description, content } = req.body;
            const course_id = req.params.id
            let imageUrl;

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                });
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const newLesson = new Lesson({
                title,
                description,
                content,
                images: imageUrl || '',
            });

            await newLesson.save();

            const savedLesson = await Course.findById(newLesson._id).populate('author', 'displayName photoURL')

            req.io.emit('course_added', savedLesson);
            res.json(newLesson);
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
                    console.log(courseDeleteds);
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
