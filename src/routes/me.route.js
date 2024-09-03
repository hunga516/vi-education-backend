import express from 'express';
import meCoursesController from '../app/controllers/MeCoursesController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

router.get('/courses', meCoursesController.meCourses);
router.get('/courses/edit/:id', meCoursesController.meEditCourse);
router.put('/courses/edit/store/:id', meCoursesController.storeEditCourse);
router.delete('/courses/delete/:id', meCoursesController.deleteCourse);
router.get('/courses/trash', meCoursesController.trash);
router.delete('/courses/forceDelete/:id', meCoursesController.forceDeleteCourse);
router.patch('/courses/restore/:id', meCoursesController.restore);

export default router;
