import { Router } from "express";
import upload from "../utils/m";
import { createPost, getPost, getPosts, getCatPosts, getUserPosts, deletePost, editPost } from "../contorllers/postController";
import authMiddleware from "../middleware/authMiddlware";

const router = Router()

router.route('/').get(getPosts).post(authMiddleware, upload.single('thumbnail'), createPost)
router.route('/:id').get(getPost).patch(authMiddleware, upload.single('thumbnail'), editPost).delete(authMiddleware, deletePost)
router.get('/categories/:id', getCatPosts)
router.get('/users/:id', getUserPosts)
export default router