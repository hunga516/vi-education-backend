import cloudinary from '../../../config/cloudinary/index.js';
import csv from 'csvtojson' //for import
import { Parser } from 'json2csv'; //for export
import fs from 'fs'
import Users from '../../models/Users.js';
// import HistoryPost from '../../models/Course/HistoryPost.js';
import path from 'path'
import { fileURLToPath } from 'url';
import formatFileSize from '../../../utils/formatFileSize.js';
import Post from '../../models/Posts/Post.js';

// Định nghĩa lại __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



class PostController {
    // [GET] /posts
    async getAllPosts(req, res, next) {
        const { _id, sort = "postId", order, content, page = 1 } = req.query

        let query = { isDeleted: false }
        if (content) {
            query.content = content;
        }
        if (_id) {
            query._id = _id
        }

        try {
            const posts = await Post.find(query).sort({ [sort]: order || -1 }).populate('author')
            const totalPosts = await Post.find(query).countDocuments()
            res.json({
                posts,
                totalPosts
            });
        } catch (error) {
            next(error);
        }
    }

    async countAllPosts(req, res, next) {
        try {
            const totalPosts = await Post.countDocuments()
            res.json(totalPosts);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /posts/trash
    async getAllTrashPosts(req, res, next) {
        const { page = 1 } = req.query
        const skip = (page - 1) * 10

        try {
            const posts = await Post.find({ isDeleted: true }).skip(skip).limit(10).sort({ deletedAt: -1 }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })
            const totalPostsDeleted = await Post.find({ isDeleted: true }).countDocuments()
            res.json({
                posts,
                totalPostsDeleted
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /posts/:id
    async getPostByPostId(req, res, next) {
        try {
            const course = await Post.findOne({ _id: req.params.id }).populate('course', 'title');
            res.json(course)
        } catch (error) {
            next(error);
        }
    }

    // [POST] /posts
    async addPost(req, res, next) {
        try {
            console.log('Bắt đầu thêm bài viết');
            const { author, content } = req.body;
            console.log('Dữ liệu nhận được:', { author, content });

            let mediaUrl;
            const fileType = req.file ? req.file.mimetype : null;

            if (req.file) {
                console.log('File nhận được:', req.file);
                if (fileType.startsWith('image/')) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'posts/images'
                    });
                    mediaUrl = result.secure_url;
                    console.log('Upload ảnh thành công:', mediaUrl);
                } else if (fileType.startsWith('video/')) {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        resource_type: 'video',
                        folder: 'posts/videos'
                    });
                    mediaUrl = result.secure_url;
                    console.log('Upload video thành công:', mediaUrl);
                } else {
                    console.log('Định dạng file không hỗ trợ:', fileType);
                }
            } else {
                console.log('Không có file được upload.');
            }

            const newPost = new Post({
                author,
                content,
                media: mediaUrl || '',
            });
            await newPost.save();
            console.log('Bài viết đã lưu:', newPost);

            const savedPost = await Post.findById(newPost._id).populate('author');
            console.log('Bài viết đã lưu với author:', savedPost);
            req.io.emit('post:create', savedPost);
            console.log('Sự kiện phát thành công cho bài viết mới');
            res.json(newPost);
        } catch (error) {
            console.error(error); // Để xem chi tiết lỗi trên console server
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm bài viết.',
                error: error.message // Hoặc một thuộc tính cụ thể của error
            });
        }
    }


    //[DELETE] /posts/:id
    async softDeletePost(req, res, next) {
        try {
            const newPostDeleted = await Post.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: true,
                deletedBy: req.query.updatedBy,
                deletedAt: new Date()
            })

            // const editorInfo = await Users.findById(req.query.updatedBy)
            // const newHistoryPost = new HistoryPost({
            //     updatedBy: req.query.updatedBy,
            //     updatedContent: `${editorInfo.displayName} cho vào thùng rác bài học ${newPostDeleted.title}`
            // })
            // await newHistoryPost.save()

            // const savedNewHistoryPost = await HistoryPost.findById(newHistoryPost._id).populate('updatedBy', 'displayName photoURL')
            const postDeleted = await Post.findById(req.params.id)
            // req.io.emit('historypost:update', savedNewHistoryPost);
            req.io.emit('post:soft-delete', postDeleted)
            res.json(postDeleted)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /posts/restore/:id
    async restorePost(req, res, next) {
        try {
            const postRestored = await Post.findOneAndUpdate({ _id: req.params.id }, {
                isDeleted: false,
                deletedAt: null,
                deletedBy: null
            })

            // const editorInfo = await Users.findById(req.query.updatedBy)
            // const newHistoryPost = new HistoryPost({
            //     updatedBy: req.query.updatedBy,
            //     updatedContent: `${editorInfo.displayName} khôi phục bài học ${postRestored.title}`
            // })
            // await newHistoryPost.save()

            // const savedNewHistoryPost = await HistoryPost.findById(newHistoryPost._id).populate('updatedBy', 'displayName photoURL')
            // req.io.emit('historypost:update', savedNewHistoryPost);
            req.io.emit('post:restore', postRestored)
            res.json(postRestored)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /courses/:id
    async editPost(req, res, next) {
        try {
            // const editorInfo = await Users.findById(req.body.updatedBy)
            // const newHistoryPost = new HistoryPost({
            //     updatedBy: req.body.updatedBy,
            //     updatedContent: `${editorInfo.displayName} chỉnh sửa bài học ${req.body.title}`
            // })
            // await newHistoryPost.save()

            let imageUrl;
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {});
                imageUrl = result.secure_url;
            } else {
                console.log('khong co file');
            }

            const response = await Post.findOneAndUpdate({ _id: req.params.id }, { ...req.body, images: imageUrl || req.body.images }, { new: true }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })

            // const savedNewHistoryPost = await HistoryPost.findById(newHistoryPost._id).populate('updatedBy', 'displayName photoURL')
            // req.io.emit('historypost:update', savedNewHistoryPost);
            req.io.emit('post:update', response)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    async handleFormAction(req, res, next) {
        try {
            switch (req.body.action) {
                case 'soft-delete':
                    await Post.updateMany({ _id: { $in: req.body.posts_id } }, {
                        isDeleted: true,
                        deletedBy: req.body.userId,
                        deletedAt: new Date()
                    });

                    const postDeleted = await Post.find({ _id: { $in: req.body.posts_id } })
                    req.io.emit('post:soft-delete', postDeleted)
                    break;
                case 'restore':
                    await Post.updateMany({ _id: { $in: req.body.posts_id } }, {
                        isDeleted: false,
                        deletedAt: null,
                        deletedBy: null
                    });
                    const postsRestored = await Post.find({ _id: { $in: req.body.posts_id } })
                    req.io.emit('post:restore', postsRestored)
                    break;
                case 'forceDelete':
                    await Post.deleteMany({ _id: { $in: req.body.posts_id } });
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

    //[GET] /posts/history
    async getAllHistoryPosts(req, res, next) {
        const { limit } = req.query
        try {
            const allHistory = await HistoryPost.find({}).populate('updatedBy', 'displayName photoURL').limit(limit).sort({ updatedAt: -1 })
            res.json(allHistory)
        } catch (error) {
            next(error)
        }
    }

    //[POST] /posts/import-csv
    async importPostsByCsv(req, res, next) {
        try {
            const jsonArray = await csv().fromFile(req.file.path);


            if (!jsonArray || jsonArray.length === 0) {
                return res.status(400).json({ message: 'File CSV không chứa dữ liệu' });
            }

            const postsToInsert = jsonArray.map(async (postData) => {
                if (!postData.title || !postData.description) {
                    throw new Error('Thiếu trường bắt buộc trong CSV');
                }
                //
                const newPost = new Post({
                    title: postData.title,
                    description: postData.description,
                    images: postData.images || '',
                    content: postData.content || '',
                    course: postData.course || undefined
                });

                return await newPost.save();
            });

            // const importAuthor = await Users.findById(req.body.updatedBy)

            // const newHistoryPost = new HistoryPost({
            //     updatedBy: req.body.updatedBy,
            //     updatedContent: `${importAuthor.displayName} đã tải lên tệp ${req.file.filename}`,
            //     type: 'Import CSV',
            //     fileName: `${req.file.filename}`,
            //     size: formatFileSize(req.file.size)
            // })
            // await newHistoryPost.save()

            const posts = await Promise.all(postsToInsert);
            const savedPosts = await Post.find({ _id: { $in: posts.map(post => post._id) } }).populate({
                path: 'course',
                populate: {
                    path: 'author',
                    select: 'photoURL displayName'
                }
            })
            // const savedNewHistoryPost = await HistoryPost.findById(newHistoryPost._id).populate('updatedBy', 'displayName photoURL')
            req.io.emit('post:create', savedPosts)
            // req.io.emit('historypost:update', savedNewHistoryPost);
            res.json(posts);
        } catch (error) {
            console.log('Lỗi:', error);
            next(error);
        }
    }


    //[POST] /courses/export-csv
    async exportPostsToCsv(req, res, next) {
        const data = await Post.find({}).lean();
        const fields = ['title', 'description', 'images', 'content', 'course'];
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(data);

            // Tạo file CSV và lưu vào thư mục tạm
            const filePath = path.join(__dirname, '../../../../exports/posts/data.csv');
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

            // const exportAuthor = await Users.findById(req.body.updatedBy)

            // const newHistoryPost = new HistoryPost({
            //     updatedBy: req.body.updatedBy,
            //     updatedContent: `${exportAuthor.displayName} đã tải xuống bản cập nhật bài học`,
            //     type: 'Export CSV',
            //     fileName: `All-Posts at ${new Date().toLocaleString('vi-VN')}`
            // })
            // await newHistoryPost.save()

            // const savedNewHistoryPost = await HistoryPost.findById(newHistoryPost._id).populate('updatedBy', 'displayName photoURL')
            // req.io.emit('historypost:update', savedNewHistoryPost);
        } catch (err) {
            console.error('Lỗi khi tạo file CSV:', err);
            res.status(500).json({ message: 'Lỗi khi tạo file CSV' });
        }
    }

    // async getAllImportsPosts(req, res, next) {
    //     try {
    //         const historyImports = await HistoryPost.find({ type: { $regex: new RegExp('Import CSV', 'i') } }).sort({ createdAt: -1 })
    //         res.json(historyImports)
    //     } catch (error) {
    //         next(error)
    //     }
    // }

    // async getAllExportsPosts(req, res, next) {
    //     try {
    //         const historyExports = await HistoryPost.find({ type: { $regex: new RegExp('Export CSV', 'i') } }).sort({ createdAt: -1 })
    //         res.json(historyExports)
    //     } catch (error) {
    //         next(error)
    //     }
    // }
}

export default new PostController();
