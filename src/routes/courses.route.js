import express from 'express';
import courseController from '../app/controllers/CourseController/CourseController.js';
import chapterController from '../app/controllers/CourseController/ChapterController.js'

const router = express.Router();

router.post('/handle-form-action', courseController.handleFormAction);
router.get('/:courseId', courseController.getCourseByCourseId);
router.get('/show-add-course', courseController.showAddCourse);
router.put('/:courseId', courseController.editCourse);
router.post('/', courseController.addCourse);
router.get('/', courseController.getAllCourses);


router.get('/chapters', chapterController.getAllChapters);
router.get('/:courseId/chapters', chapterController.getChaptersByCourseId); ///
router.post('/:courseId/chapters', chapterController.addChapter);


export default router;
