import express from 'express';
import courseController from '../app/controllers/CourseController/CourseController.js';
import chapterController from '../app/controllers/CourseController/ChapterController.js'

const router = express.Router();

router.post('/handle-form-action', courseController.handleFormAction);
router.delete('/:courseId', courseController.softDeleteCourse);
router.get('/trash', courseController.getAllTrashCourses);
router.post('/restore/:courseId', courseController.restoreCourse);
router.delete('/:courseId', courseController.softDeleteCourse);
router.put('/:courseId', courseController.editCourse);
router.get('/:courseId', courseController.getCourseByCourseId);
router.post('/', courseController.addCourse);
router.get('/', courseController.getAllCourses);


router.get('/chapters', chapterController.getAllChapters);
router.get('/:courseId/chapters', chapterController.getChaptersByCourseId);
router.post('/:courseId/chapters', chapterController.addChapter);


export default router;
