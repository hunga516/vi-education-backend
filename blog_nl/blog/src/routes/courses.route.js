import express from 'express';
import coursesController from '../app/controllers/CoursesController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

router.get('/create', coursesController.create);
router.post('/handle-form-action', coursesController.handleFormAction);
router.post('/create/store', coursesController.store);
router.get('/detail/:slug', coursesController.detail);
router.get('/', coursesController.index);

export default router;
