import express from 'express';
import newsController from '../app/controllers/NewsController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

router.get('/:slug/:id', newsController.show);
router.get('/', newsController.index);

export default router;
