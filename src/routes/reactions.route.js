import express from 'express';
import { uploadCloud, uploadDisk } from '../config/multer/index.js';
import reactionController from '../app/controllers/PostController/ReactionController.js';
const router = express.Router();


// router.get('/count', reactionController.countAllReactions);
// router.post('/restore/:id', reactionController.restoreReaction);
// router.delete('/:id', reactionController.softDeleteReaction);
// router.put('/:id', uploadCloud.single('images'), reactionController.editReaction);
// router.get('/:id', reactionController.getReactionByReactionId);
router.post('/', reactionController.addReaction);
router.get('/posts/:id', reactionController.getAllReactionsByPostId);
router.get('/', reactionController.getAllReactions);

export default router;
