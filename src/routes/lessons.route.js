import express from 'express';
// import lessonController from '../app/controllers/CourseController/LessonController.js'
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
const router = express.Router();

// router.post('/restore/:id', lessonController.restoreLesson);
// router.get('/count', lessonController.countAllLessons);
// router.get('/trash', lessonController.getAllTrashLessons);
// router.delete('/:id', lessonController.softDeleteLesson);
// router.put('/:id', uploadCloud.single('images'), lessonController.editLesson);
// router.get('/:id', lessonController.getLessonByLessonId);
// router.post('/', uploadCloud.single('images'), lessonController.addLesson);
// router.get('/', lessonController.getAllLessons);

export default router;
