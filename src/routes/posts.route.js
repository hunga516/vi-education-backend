import express from 'express';
import postsController from '../app/controllers/PostController/PostsController.js';
import commentController from '../app/controllers/PostController/CommentController.js';

const router = express.Router();

//Post
router.post('/', postsController.addPost);
router.get('/:postId', postsController.getPostByPostId);
router.get('/', postsController.getAllPosts);

//Comment
router.get('/comments', commentController.getAllComments);
router.get('/:postId/comments', commentController.getCommentsByPostId);


export default router;
