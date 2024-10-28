import express from 'express';
import courseController from '../app/controllers/CourseController/CourseController.js';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
const router = express.Router();

router.post('/handle-form-action', courseController.handleFormAction);
router.get('/trash', courseController.getAllTrashCourses);
router.get('/count', courseController.countAllCourses);
router.post('/restore/:id', courseController.restoreCourse);
router.get('/history', courseController.getAllHistoryCourses);
router.post('/import-csv', uploadDisk.single('files'), courseController.importCoursesByCsv);
router.get('/import-csv', courseController.getAllImportsCourses);
router.post('/export-csv', uploadDisk.single('files'), courseController.exportCoursesToCsv);
router.get('/export-csv', courseController.getAllExportsCourses);
router.delete('/:id', courseController.softDeleteCourse);
router.put('/:id', uploadCloud.single('images'), courseController.editCourse);
router.get('/:id', courseController.getCourseByCourseId);
router.post('/', uploadCloud.single('images'), courseController.addCourse);
router.get('/', courseController.getAllCourses);




export default router;
