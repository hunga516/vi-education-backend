import express from 'express';
import lessonController from '../app/controllers/CourseController/LessonController.js'
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
const router = express.Router();


router.post('/handle-form-action', lessonController.handleFormAction);
router.get('/trash', lessonController.getAllTrashLessons);
router.get('/count', lessonController.countAllLessons);
router.post('/restore/:id', lessonController.restoreLesson);
router.get('/history', lessonController.getAllHistoryLessons);
router.post('/import-csv', uploadDisk.single('files'), lessonController.importLessonsByCsv);
router.get('/import-csv', lessonController.getAllImportsLessons);
router.post('/export-csv', uploadDisk.single('files'), lessonController.exportLessonsToCsv);
router.get('/export-csv', lessonController.getAllExportsLessons);
router.delete('/:id', lessonController.softDeleteLesson);
router.put('/:id', uploadCloud.single('images'), lessonController.editLesson);
router.get('/:id', lessonController.getLessonByLessonId);
router.post('/', uploadCloud.single('images'), lessonController.addLesson);
router.get('/', lessonController.getAllLessons);

export default router;
