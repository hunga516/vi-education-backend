import express from 'express';
import apiCoursesController from '../../app/api/ApiCoursesController.js';

const router = express.Router();

router.get('/create', apiCoursesController.create);
router.post('/handle-form-action', apiCoursesController.handleFormAction);
router.post('/create/store', apiCoursesController.store);
router.get('/detail/:slug', apiCoursesController.detail);
router.get('/', apiCoursesController.getCourses);

export default router;
