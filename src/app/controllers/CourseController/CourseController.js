import cloudinary from '../../../config/cloudinary/index.js';
import Course from '../../models/Course/Course.js';
import csv from 'csvtojson' //for import
import { Parser } from 'json2csv'; //for export
import fs from 'fs'
import Users from '../../models/Users.js';
import HistoryCourse from '../../models/Course/HistoryCourse.js';
import path from 'path'
import { fileURLToPath } from 'url';
import formatFileSize from '../../../utils/formatFileSize.js';

// Định nghĩa lại __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



class CourseController {
    // [GET] /courses
    async getAllCourses(req, res, next) {
        const { _id, sort = "courseId", order, title, description, author, page = 1 } = req.query
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
            const courses = await Course.find(query).skip(skip).limit(10).populate('author', 'displayName photoURL email').populate('updatedBy', 'displayName photoURL email').sort({ [sort]: order || -1 })
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
        const { page = 1 } = req.query
        const skip = (page - 1) * 10

        try {
            const courses = await Course.find({ isDeleted: true }).skip(skip).limit(10).sort({ deletedAt: -1 }).populate('author', 'displayName photoURL');
            const totalCoursesDeleted = await Course.find({ isDeleted: true }).countDocuments()
            res.json({
                courses,
                totalCoursesDeleted
            });
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
                const result = await cloudinary.uploader.upload(req.file.path, {});
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const editorInfo = await Users.findById(req.body.updatedBy)
            const newHistoryCourse = new HistoryCourse({
                updatedBy: req.body.updatedBy,
                updatedContent: `${editorInfo.displayName} thêm khoá học ${title}`
            })
            await newHistoryCourse.save()

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
            const savedNewHistoryCourse = await HistoryCourse.findById(newHistoryCourse._id).populate('updatedBy', 'displayName photoURL')
            console.log(savedCourse);
            req.io.emit('course:create', savedCourse);
            req.io.emit('historycourse:update', savedNewHistoryCourse);
            res.json(newCourse);
        } catch (error) {
            next(error);
        }
    }



    //[DELETE] /courses/:id
    async softDeleteCourse(req, res, next) {
        try {
            const newCourseDeleted = await Course.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: true,
                deletedBy: req.query.updatedBy,
                deletedAt: new Date()
            })

            const editorInfo = await Users.findById(req.query.updatedBy)
            const newHistoryCourse = new HistoryCourse({
                updatedBy: req.query.updatedBy,
                updatedContent: `${editorInfo.displayName} cho vào thùng rác khoá học ${newCourseDeleted.title}`
            })
            await newHistoryCourse.save()

            const savedNewHistoryCourse = await HistoryCourse.findById(newHistoryCourse._id).populate('updatedBy', 'displayName photoURL')
            const courseDeleted = await Course.findById(req.params.id)
            req.io.emit('historycourse:update', savedNewHistoryCourse);
            req.io.emit('course:soft-delete', courseDeleted)
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

            const editorInfo = await Users.findById(req.query.updatedBy)
            const newHistoryCourse = new HistoryCourse({
                updatedBy: req.query.updatedBy,
                updatedContent: `${editorInfo.displayName} khôi phục khoá học ${courseRestored.title}`
            })
            await newHistoryCourse.save()

            const savedNewHistoryCourse = await HistoryCourse.findById(newHistoryCourse._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('historycourse:update', savedNewHistoryCourse);
            req.io.emit('course:restore', courseRestored)
            res.json(courseRestored)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /courses/:id
    async editCourse(req, res, next) {
        try {
            const editorInfo = await Users.findById(req.body.updatedBy)
            const newHistoryCourse = new HistoryCourse({
                updatedBy: req.body.updatedBy,
                updatedContent: `${editorInfo.displayName} chỉnh sửa khoá học ${req.body.title}`
            })
            await newHistoryCourse.save()

            let imageUrl;
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {});
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const response = await Course.findOneAndUpdate({ _id: req.params.id }, {
                ...req.body, images: imageUrl || ''
            }, { new: true }).populate('author')

            const savedNewHistoryCourse = await HistoryCourse.findById(newHistoryCourse._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('historycourse:update', savedNewHistoryCourse);
            req.io.emit('course:update', response)
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
                    req.io.emit('course:soft-delete', courseDeleteds)
                    break;
                case 'restore':
                    await Course.updateMany({ _id: { $in: req.body.courseIds } }, {
                        isDeleted: false,
                        deletedAt: null,
                        deletedBy: null
                    });
                    const courseRestoreds = await Course.find({ _id: { $in: req.body.courseIds } })
                    req.io.emit('course:restore', courseRestoreds)
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

    async getAllHistoryCourses(req, res, next) {
        const { limit } = req.query
        try {
            const allHistory = await HistoryCourse.find({}).populate('updatedBy', 'displayName photoURL').limit(limit).sort({ updatedAt: -1 })
            res.json(allHistory)
        } catch (error) {
            next(error)
        }
    }

    //[POST] /courses/import-csv
    async importCoursesByCsv(req, res, next) {
        try {
            const jsonArray = await csv().fromFile(req.file.path);


            // Kiểm tra xem có dữ liệu hay không
            if (!jsonArray || jsonArray.length === 0) {
                return res.status(400).json({ message: 'File CSV không chứa dữ liệu' });
            }

            // Tạo một mảng các promise để lưu từng course
            const coursesToInsert = jsonArray.map(async (courseData) => {
                // Kiểm tra xem các trường bắt buộc có tồn tại không
                if (!courseData.title || !courseData.description) {
                    throw new Error('Thiếu trường bắt buộc trong CSV');
                }

                // Tạo một instance mới của Course
                const newCourse = new Course({
                    title: courseData.title,
                    description: courseData.description,
                    images: courseData.images || '', // sử dụng giá trị mặc định nếu không có
                    content: courseData.content || '', // sử dụng giá trị mặc định nếu không có
                    author: courseData.author || null, // Nếu author không có, đặt là null hoặc một giá trị mặc định
                    role: courseData.role || '', // sử dụng giá trị mặc định nếu không có
                    courseId: courseData.courseId || undefined // Thêm trường courseId nếu cần
                });

                // Lưu course vào cơ sở dữ liệu
                return await newCourse.save();
            });

            const importAuthor = await Users.findById(req.body.updatedBy)

            const newHistoryCourse = new HistoryCourse({
                updatedBy: req.body.updatedBy,
                updatedContent: `${importAuthor.displayName} đã tải lên tệp ${req.file.filename}`,
                type: 'Import CSV',
                fileName: `${req.file.filename}`,
                size: formatFileSize(req.file.size)
            })
            await newHistoryCourse.save()

            // Chờ tất cả các promise hoàn thành
            const courses = await Promise.all(coursesToInsert);
            const savedCourses = await Course.find({ _id: { $in: courses.map(course => course._id) } }).populate('author', 'displayName photoURL');
            const savedNewHistoryCourse = await HistoryCourse.findById(newHistoryCourse._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('course:create', savedCourses)
            req.io.emit('historycourse:update', savedNewHistoryCourse);
            res.json(courses);
        } catch (error) {
            console.log('Lỗi:', error);
            next(error);
        }
    }


    //[POST] /courses/export-csv
    async exportCoursesToCsv(req, res, next) {
        const data = await Course.find({}).lean();
        const fields = ['title', 'description', 'images', 'author', 'content', 'role', 'courseId'];
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(data);

            // Tạo file CSV và lưu vào thư mục tạm
            const filePath = path.join(__dirname, '../../../../exports/courses/data.csv');
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

            const newHistoryCourse = new HistoryCourse({
                updatedBy: req.body.updatedBy,
                updatedContent: `${exportAuthor.displayName} đã tải xuống bản cập nhật khoá học`,
                type: 'Export CSV',
                fileName: `All-Courses at ${new Date().toLocaleString('vi-VN')}`
            })
            await newHistoryCourse.save()

            const savedNewHistoryCourse = await HistoryCourse.findById(newHistoryCourse._id).populate('updatedBy', 'displayName photoURL')
            console.log(savedNewHistoryCourse);
            req.io.emit('historycourse:update', savedNewHistoryCourse);
        } catch (err) {
            console.error('Lỗi khi tạo file CSV:', err);
            res.status(500).json({ message: 'Lỗi khi tạo file CSV' });
        }
    }

    async getAllImportsCourses(req, res, next) {
        try {
            const historyImports = await HistoryCourse.find({ type: { $regex: new RegExp('Import CSV', 'i') } }).sort({ createdAt: -1 })
            res.json(historyImports)
        } catch (error) {
            next(error)
        }
    }

    async getAllExportsCourses(req, res, next) {
        try {
            const historyExports = await HistoryCourse.find({ type: { $regex: new RegExp('Export CSV', 'i') } }).sort({ createdAt: -1 })
            res.json(historyExports)
        } catch (error) {
            next(error)
        }
    }
}

export default new CourseController();
