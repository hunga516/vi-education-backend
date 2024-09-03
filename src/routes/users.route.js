import express from 'express';
import usersController from '../app/controllers/UsersController.js'; // Đổi extension sang .js nếu cần

const router = express.Router();

// router.get('/create', usersController.create);
// router.post('/handle-form-action', usersController.handleFormAction);
// router.post('/create/store', usersController.store);
// router.get('/detail/:slug', usersController.detail);
router.get('/', usersController.index);
router.post('/create', usersController.create);

export default router;
