import cloudinary from '../../../config/cloudinary/index.js';
import Lesson from '../../models/Course/Lesson.js';
import csv from 'csvtojson' //for import
import { Parser } from 'json2csv'; //for export
import fs from 'fs'
import Users from '../../models/Users.js';
import HistoryLesson from '../../models/Course/HistoryLesson.js';
import path from 'path'
import { fileURLToPath } from 'url';
import formatFileSize from '../../../utils/formatFileSize.js';

// Định nghĩa lại __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



class LessonController {
    // [GET] /lessons
    async getAllLessons(req, res, next) {
        const { _id, sort = "lessonId", order, title, description, author, page = 1 } = req.query
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
        if (author) {
            query.author = author
        }


        try {
            const lessons = await Lesson.find(query).skip(skip).limit(10).sort({ [sort]: order || -1 }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
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
            const lessons = await Lesson.find({ isDeleted: true }).skip(skip).limit(10).sort({ deletedAt: -1 }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })
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
            const course = await Lesson.findOne({ _id: req.params.id }).populate('course', 'title');
            res.json(course)
        } catch (error) {
            next(error);
        }
    }

    // [POST] /lessons
    async addLesson(req, res, next) {
        try {
            const { title, description, author, content, role, course_id } = req.body;
            let imageUrl;

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {});
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const editorInfo = await Users.findById(req.body.updatedBy)
            const newHistoryLesson = new HistoryLesson({
                updatedBy: req.body.updatedBy,
                updatedContent: `${editorInfo.displayName} thêm bài học ${title}`
            })
            await newHistoryLesson.save()

            const newLesson = new Lesson({
                title,
                description,
                author,
                content,
                role,
                images: imageUrl || '',
                course: course_id
            });
            await newLesson.save();

            const savedLesson = await Lesson.findById(newLesson._id).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })
            const savedNewHistoryLesson = await HistoryLesson.findById(newHistoryLesson._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('lesson:create', savedLesson);
            req.io.emit('historylesson:update', savedNewHistoryLesson);
            res.json(newLesson);
        } catch (error) {
            next(error);
        }
    }



    //[DELETE] /lessons/:id
    async softDeleteLesson(req, res, next) {
        try {
            const newLessonDeleted = await Lesson.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: true,
                deletedBy: req.query.updatedBy,
                deletedAt: new Date()
            })

            const editorInfo = await Users.findById(req.query.updatedBy)
            const newHistoryLesson = new HistoryLesson({
                updatedBy: req.query.updatedBy,
                updatedContent: `${editorInfo.displayName} cho vào thùng rác bài học ${newLessonDeleted.title}`
            })
            await newHistoryLesson.save()

            const savedNewHistoryLesson = await HistoryLesson.findById(newHistoryLesson._id).populate('updatedBy', 'displayName photoURL')
            const lessonDeleted = await Lesson.findById(req.params.id)
            req.io.emit('historylesson:update', savedNewHistoryLesson);
            req.io.emit('lesson:soft-delete', lessonDeleted)
            res.json(lessonDeleted)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /lessons/restore/:id
    async restoreLesson(req, res, next) {
        try {
            const lessonRestored = await Lesson.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: false,
                deletedAt: null,
                deletedBy: null
            })

            const editorInfo = await Users.findById(req.query.updatedBy)
            const newHistoryLesson = new HistoryLesson({
                updatedBy: req.query.updatedBy,
                updatedContent: `${editorInfo.displayName} khôi phục bài học ${lessonRestored.title}`
            })
            await newHistoryLesson.save()

            const savedNewHistoryLesson = await HistoryLesson.findById(newHistoryLesson._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('historylesson:update', savedNewHistoryLesson);
            req.io.emit('lesson:restore', lessonRestored)
            res.json(lessonRestored)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /courses/:id
    async editLesson(req, res, next) {
        try {
            const editorInfo = await Users.findById(req.body.updatedBy)
            const newHistoryLesson = new HistoryLesson({
                updatedBy: req.body.updatedBy,
                updatedContent: `${editorInfo.displayName} chỉnh sửa bài học ${req.body.title}`
            })
            await newHistoryLesson.save()

            let imageUrl;
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {});
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const response = await Lesson.findOneAndUpdate({ _id: req.params.id }, { ...req.body, images: imageUrl || req.body.images }, { new: true }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })

            const savedNewHistoryLesson = await HistoryLesson.findById(newHistoryLesson._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('historylesson:update', savedNewHistoryLesson);
            req.io.emit('lesson:update', response)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    async handleFormAction(req, res, next) {
        try {
            switch (req.body.action) {
                case 'soft-delete':
                    await Lesson.updateMany({ _id: { $in: req.body.lesson_ids } }, {
                        isDeleted: true,
                        deletedBy: req.body.userId,
                        deletedAt: new Date()
                    });

                    const lessonDeleted = await Lesson.find({ _id: { $in: req.body.lessons_id } })
                    req.io.emit('lesson:soft-delete', lessonDeleted)
                    break;
                case 'restore':
                    await Lesson.updateMany({ _id: { $in: req.body.lessons_id } }, {
                        isDeleted: false,
                        deletedAt: null,
                        deletedBy: null
                    });
                    const lessonsRestored = await Lesson.find({ _id: { $in: req.body.lessons_id } })
                    req.io.emit('lesson:restore', lessonsRestored)
                    break;
                case 'forceDelete':
                    await Lesson.deleteMany({ _id: { $in: req.body.lessons_id } });
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

    //[GET] /lessons/history
    async getAllHistoryLessons(req, res, next) {
        const { limit } = req.query
        try {
            const allHistory = await HistoryLesson.find({}).populate('updatedBy', 'displayName photoURL').limit(limit).sort({ updatedAt: -1 })
            res.json(allHistory)
        } catch (error) {
            next(error)
        }
    }

    //[POST] /lessons/import-csv
    async importLessonsByCsv(req, res, next) {
        try {
            const jsonArray = await csv().fromFile(req.file.path);


            if (!jsonArray || jsonArray.length === 0) {
                return res.status(400).json({ message: 'File CSV không chứa dữ liệu' });
            }

            const lessonsToInsert = jsonArray.map(async (lessonData) => {
                if (!lessonData.title || !lessonData.description) {
                    throw new Error('Thiếu trường bắt buộc trong CSV');
                }
                //
                const newLesson = new Lesson({
                    title: lessonData.title,
                    description: lessonData.description,
                    images: lessonData.images || '',
                    content: lessonData.content || '',
                    course: lessonData.course || undefined
                });

                return await newLesson.save();
            });

            const importAuthor = await Users.findById(req.body.updatedBy)

            const newHistoryLesson = new HistoryLesson({
                updatedBy: req.body.updatedBy,
                updatedContent: `${importAuthor.displayName} đã tải lên tệp ${req.file.filename}`,
                type: 'Import CSV',
                fileName: `${req.file.filename}`,
                size: formatFileSize(req.file.size)
            })
            await newHistoryLesson.save()

            const lessons = await Promise.all(lessonsToInsert);
            const savedLessons = await Lesson.find({ _id: { $in: lessons.map(lesson => lesson._id) } }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })
            const savedNewHistoryLesson = await HistoryLesson.findById(newHistoryLesson._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('lesson:create', savedLessons)
            req.io.emit('historylesson:update', savedNewHistoryLesson);
            res.json(lessons);
        } catch (error) {
            console.log('Lỗi:', error);
            next(error);
        }
    }


    //[POST] /courses/export-csv
    async exportLessonsToCsv(req, res, next) {
        const data = await Lesson.find({}).lean();
        const fields = ['title', 'description', 'images', 'content', 'course'];
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(data);

            // Tạo file CSV và lưu vào thư mục tạm
            const filePath = path.join(__dirname, '../../../../exports/lessons/data.csv');
            fs.writeFileSync(filePath, csv);
            console.log('File CSV đã được tạo thành công!');

            res.sendFile(filePath, { headers: { 'Content-Disposition': 'attachment; filename=data.csv' } }, (err) => {
                if (err) {
                    console.error('Lỗi khi tải file:', err);
                    return res.status(500).json({ message: 'Lỗi khi tải file CSV' });
                }

                // Xóa file sau khi gửi
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Lỗi khi xóa file:', unlinkErr);
                    }
                });
            });

            const exportAuthor = await Users.findById(req.body.updatedBy)

            const newHistoryLesson = new HistoryLesson({
                updatedBy: req.body.updatedBy,
                updatedContent: `${exportAuthor.displayName} đã tải xuống bản cập nhật bài học`,
                type: 'Export CSV',
                fileName: `All-Lessons at ${new Date().toLocaleString('vi-VN')}`
            })
            await newHistoryLesson.save()

            const savedNewHistoryLesson = await HistoryLesson.findById(newHistoryLesson._id).populate('updatedBy', 'displayName photoURL')
            console.log(savedNewHistoryLesson);
            req.io.emit('historylesson:update', savedNewHistoryLesson);
        } catch (err) {
            console.error('Lỗi khi tạo file CSV:', err);
            res.status(500).json({ message: 'Lỗi khi tạo file CSV' });
        }
    }

    async getAllImportsLessons(req, res, next) {
        try {
            const historyImports = await HistoryLesson.find({ type: { $regex: new RegExp('Import CSV', 'i') } }).sort({ createdAt: -1 })
            res.json(historyImports)
        } catch (error) {
            next(error)
        }
    }

    async getAllExportsLessons(req, res, next) {
        try {
            const historyExports = await HistoryLesson.find({ type: { $regex: new RegExp('Export CSV', 'i') } }).sort({ createdAt: -1 })
            res.json(historyExports)
        } catch (error) {
            next(error)
        }
    }
}

export default new LessonController();
