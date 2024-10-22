import cloudinary from '../../../config/cloudinary/index.js';
import Course from '../../models/Course/Course.js';
import csv from 'csvtojson' //for import
import { Parser } from 'json2csv'; //for export
import fs from 'fs'
import Users from '../../models/Users.js';
import HistoryCourse from '../../models/Course/HistoryCourse.js';


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

            req.io.emit('course:create', savedCourse);

            res.json(newCourse);
        } catch (error) {
            next(error);
        }
    }

    //[POST] /courses/import-csv
    async importCoursesByCsv(req, res, next) {
        try {
            const jsonArray = await csv().fromFile(req.file.path);

            const courses = await Course.insertMany(jsonArray)
            res.json(courses)
        } catch (error) {
            console.log('loi');
            next(error);

        }
    }

    //[POST] /courses/export-csv
    async exportCoursesToCsv(req, res, next) {
        // Lấy dữ liệu từ cơ sở dữ liệu
        const data = await Course.find({}).lean(); // Thêm .lean() để tối ưu hóa hiệu suất

        // Định nghĩa các trường (fields) của file CSV
        const fields = ['title', 'description', 'images', 'author', 'content', 'role']; // Tên các trường tương ứng với key trong object
        const opts = { fields }; // Tuỳ chọn với định dạng các fields

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(data); // Chuyển đổi mảng đối tượng thành định dạng CSV

            // Lưu file CSV vào thư mục 'exports'
            fs.writeFileSync('./exports/data.csv', csv);
            console.log('File CSV đã được tạo thành công!');
            res.download('./exports/data.csv'); // Tải file CSV về cho người dùng
        } catch (err) {
            console.error('Lỗi khi tạo file CSV:', err);
            res.status(500).json({ message: 'Lỗi khi tạo file CSV' }); // Trả về thông báo lỗi
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

            newHistoryCourse.save()

            const response = await Course.findOneAndUpdate({ _id: req.params.id }, {
                ...req.body,
            }, { new: true }).populate('author')
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
            const allHistory = await HistoryCourse.find({}).populate('updatedBy', 'displayName photoURL').limit(limit)
            res.json(allHistory)
        } catch (error) {
            next(error)
        }
    }
}

export default new CourseController();
