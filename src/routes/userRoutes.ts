import { Router } from "express";
import authMiddleware from "../middleware/authMiddlware";

import { getAuthors, getProfile, getUser, loginUser, registerUser } from "../contorllers/userControllers";

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/', getAuthors)
router.get('/:id', getUser)
router.get('/profile', authMiddleware, getProfile)

export default router