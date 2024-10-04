import express from 'express';
import courseController from '../app/controllers/CourseController/CourseController.js';
import chapterController from '../app/controllers/CourseController/ChapterController.js'
import upload from '../config/multer/index.js';

const router = express.Router();

router.post('/handle-form-action', courseController.handleFormAction);
router.delete('/:id', courseController.softDeleteCourse);
router.get('/trash', courseController.getAllTrashCourses);
router.post('/restore/:id', courseController.restoreCourse);
router.delete('/:id', courseController.softDeleteCourse);
router.put('/:id', courseController.editCourse);
router.get('/:id', courseController.getCourseByCourseId);
router.post('/', upload.single('images'), courseController.addCourse);
router.get('/', courseController.getAllCourses);


router.get('/chapters', chapterController.getAllChapters);
router.get('/:id/chapters', chapterController.getAllChaptersByCourseId);
router.post('/:id/chapters', chapterController.addChapter);


export default router;
