import express from 'express';
import messageController from '../app/controllers/Message/MessageController.js';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
const router = express.Router();


// router.post('/handle-form-action', messageController.handleFormAction);
// router.get('/trash', messageController.getAllTrashLessons);
// router.get('/count', messageController.countAllLessons);
// router.post('/restore/:id', messageController.restoreLesson);
// router.get('/history', messageController.getAllHistoryLessons);
// router.post('/import-csv', uploadDisk.single('files'), messageController.importLessonsByCsv);
// router.get('/import-csv', messageController.getAllImportsLessons);
// router.post('/export-csv', uploadDisk.single('files'), messageController.exportLessonsToCsv);
// router.get('/export-csv', messageController.getAllExportsLessons);
// router.get('/check-user-eligibility', messageController.checkUserEligibility);
// router.get('/lessons-learned', messageController.getLessonsLearnedByUser);
// router.delete('/:id', messageController.softDeleteLesson);
// router.post('/:id/set-lesson-learned', messageController.setLessonLearned);
// router.put('/:id', uploadCloud.single('images'), messageController.editLesson);
// router.get('/:id', messageController.getLessonByLessonId);
router.post('/', messageController.addMessage);
router.get('/', messageController.getAllMessages);



export default router;
