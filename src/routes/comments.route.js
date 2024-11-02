import express from 'express';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
import commentController from '../app/controllers/PostController/CommentController.js';
const router = express.Router();


// router.get('/count', commentController.countAllComments);
// router.post('/restore/:id', commentController.restoreComment);
// router.delete('/:id', commentController.softDeleteComment);
// router.put('/:id', uploadCloud.single('images'), commentController.editComment);
// router.get('/:id', commentController.getCommentByCommentId);
router.post('/', uploadDisk.single('media'), commentController.addComment);
router.get('/', commentController.getAllComments);

export default router;
