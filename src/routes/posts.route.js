import express from 'express';
import postsController from '../app/controllers/PostsController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

// router.get('/create', postsController.create);
// router.post('/handle-form-action', postsController.handleFormAction);
// router.post('/create/store', postsController.store);
// router.get('/detail/:slug', postsController.detail);
router.get('/', postsController.index);
router.post('/create', postsController.create);

export default router;
