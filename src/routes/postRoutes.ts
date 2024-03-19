import { Router } from "express";
import upload from "../utils/m";
import { createPost, getPosts } from "../contorllers/postController";
import authMiddleware from "../middleware/authMiddlware";

const router = Router()

router.route('/').get(getPosts).post(authMiddleware, upload.single('thumbnail'), createPost)