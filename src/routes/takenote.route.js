import express from 'express';
import takeNoteController from '../app/controllers/CourseController/TakeNoteController.js';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
const router = express.Router();


// router.post('/handle-form-action', takeNoteController.handleFormAction);
// router.get('/trash', takeNoteController.getAllTrashLessons);
// router.get('/count', takeNoteController.countAllLessons);
// router.post('/restore/:id', takeNoteController.restoreLesson);
// router.get('/history', takeNoteController.getAllHistoryLessons);
// router.post('/import-csv', uploadDisk.single('files'), takeNoteController.importLessonsByCsv);
// router.get('/import-csv', takeNoteController.getAllImportsLessons);
// router.post('/export-csv', uploadDisk.single('files'), takeNoteController.exportLessonsToCsv);
// router.get('/export-csv', takeNoteController.getAllExportsLessons);
// router.get('/check-user-eligibility', takeNoteController.checkUserEligibility);
// router.get('/lessons-learned', takeNoteController.getLessonsLearnedByUser);
// router.delete('/:id', takeNoteController.softDeleteLesson);
// router.post('/:id/set-lesson-learned', takeNoteController.setLessonLearned);
// router.put('/:id', uploadCloud.single('images'), takeNoteController.editLesson);
// router.get('/:id', takeNoteController.getLessonByLessonId);
router.post('/', takeNoteController.addTakeNote);
router.get('/', takeNoteController.getAllTakeNotes);



export default router;
