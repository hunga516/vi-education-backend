import express from 'express';
import courseController from '../app/controllers/CourseController/CourseController.js';
import lessonController from '../app/controllers/CourseController/LessonController.js'
import upload from '../config/multer/index.js';

const router = express.Router();


router.get('/lessons', lessonController.getAllLessons);
// router.get('/:id/lessons', lessonController.getAllLessonsByCourseId);
router.post('/:id/lessons', lessonController.addLesson);

router.post('/handle-form-action', courseController.handleFormAction);
router.delete('/:id', courseController.softDeleteCourse);
router.get('/trash', courseController.getAllTrashCourses);
router.get('/count', courseController.countAllCourses);
router.post('/restore/:id', courseController.restoreCourse);
router.delete('/:id', courseController.softDeleteCourse);
router.put('/:id', courseController.editCourse);
router.get('/:id', courseController.getCourseByCourseId);
router.post('/', upload.single('images'), courseController.addCourse);
router.get('/', courseController.getAllCourses);




export default router;
