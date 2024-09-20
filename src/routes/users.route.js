import express from 'express';
import usersController from '../app/controllers/UsersController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

// router.get('/create', usersController.create);
// router.post('/handle-form-action', usersController.handleFormAction);
// router.post('/create/store', usersController.store);
// router.get('/detail/:slug', usersController.detail);
router.post('/create', usersController.create);
router.get('/email/:email', usersController.getUserByEmail);
router.get('/', usersController.index);


export default router;
