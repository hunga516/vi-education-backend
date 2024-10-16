import express from 'express';
import userController from '../app/controllers/UserController.js';

const router = express.Router();

router.post('/handle-form-action', userController.handleFormAction)
router.post('/sign-in', userController.signIn)
router.post('/sign-up', userController.signUp)
router.get('/trash', userController.getUsersTrash)
router.put('/restore/:id', userController.restoreUser)
router.delete('/:id', userController.softDeleteUser)
router.get('/:id', userController.getUserById)
router.put('/:id', userController.editUser)
router.get('/email/:email', userController.getUserByEmail)
router.get('/', userController.getAllUsers)


export default router;
