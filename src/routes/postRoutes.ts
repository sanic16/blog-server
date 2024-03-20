import { Router } from "express";
import upload from "../utils/m";
import { createPost, getPost, getPosts, getCatPosts, getUserPosts, deletePost } from "../contorllers/postController";
import authMiddleware from "../middleware/authMiddlware";

const router = Router()

router.route('/').get(getPosts).post(authMiddleware, upload.single('thumbnail'), createPost)
router.get('/:id', getPost)
router.delete('/:id', authMiddleware, deletePost)
router.get('/categories/:id', getCatPosts)
router.get('/users/:id', getUserPosts)
export default router