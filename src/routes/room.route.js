import express from 'express';
import roomController from '../app/controllers/Message/RoomController.js';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
const router = express.Router();


// router.post('/handle-form-action', roomController.handleFormAction);
// router.get('/trash', roomController.getAllTrashLessons);
// router.get('/count', roomController.countAllLessons);
// router.post('/restore/:id', roomController.restoreLesson);
// router.get('/history', roomController.getAllHistoryLessons);
// router.post('/import-csv', uploadDisk.single('files'), roomController.importLessonsByCsv);
// router.get('/import-csv', roomController.getAllImportsLessons);
// router.post('/export-csv', uploadDisk.single('files'), roomController.exportLessonsToCsv);
// router.get('/export-csv', roomController.getAllExportsLessons);
// router.get('/check-user-eligibility', roomController.checkUserEligibility);
// router.get('/lessons-learned', roomController.getLessonsLearnedByUser);
// router.delete('/:id', roomController.softDeleteLesson);
// router.post('/:id/set-lesson-learned', roomController.setLessonLearned);
// router.put('/:id', uploadCloud.single('images'), roomController.editLesson);
// router.get('/:id', roomController.getLessonByLessonId);
router.post('/', roomController.addRoom);
router.get('/', roomController.getAllRooms);



export default router;
