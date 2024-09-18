import express from 'express';
import courseController from '../app/controllers/CourseController/CourseController.js';
import chapterController from '../app/controllers/CourseController/ChapterController.js'

const router = express.Router();

router.get('/create', courseController.create);
router.post('/handle-form-action', courseController.handleFormAction);
router.post('/create/store', courseController.store);
router.get('/detail/:slug', courseController.detail);

router.get('/chapter', chapterController.index);
router.post('/chapter/store', chapterController.store);

router.get('/', courseController.index);

export default router;
