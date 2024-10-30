import express from 'express';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
import postController from '../app/controllers/PostController/PostController.js';
const router = express.Router();


router.post('/handle-form-action', postController.handleFormAction);
router.get('/trash', postController.getAllTrashPosts);
router.get('/count', postController.countAllPosts);
router.post('/restore/:id', postController.restorePost);
router.get('/history', postController.getAllHistoryPosts);
router.post('/import-csv', uploadDisk.single('files'), postController.importPostsByCsv);
// router.get('/import-csv', postController.getAllImportsPosts);
router.post('/export-csv', uploadDisk.single('files'), postController.exportPostsToCsv);
// router.get('/export-csv', postController.getAllExportsPosts);
router.delete('/:id', postController.softDeletePost);
// router.put('/:id', uploadCloud.single('images'), postController.editPost);
router.get('/:id', postController.getPostByPostId);
router.post('/', uploadDisk.single('media'), postController.addPost);
router.get('/', postController.getAllPosts);

export default router;
