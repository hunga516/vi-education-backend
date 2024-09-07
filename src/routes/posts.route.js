import express from 'express';
import postsController from '../app/controllers/PostsController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

// router.get('/create', postsController.create);
// router.post('/handle-form-action', postsController.handleFormAction);
// router.post('/create/store', postsController.store);
// router.get('/detail/:slug', postsController.detail);
router.get('/', postsController.showAllPost);
router.get('/comments', postsController.showAllComments);
router.post('/create-post', postsController.createPost);
router.post('/create-comment', postsController.createComment);

export default router;
