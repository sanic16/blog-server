import { Router } from "express";
import authMiddleware from "../middleware/authMiddlware";

import { changeAvatar, editUser, getAuthors, getProfile, getUser, loginUser, registerUser } from "../contorllers/userControllers";
import upload from "../utils/m";




const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/', getAuthors)
router.get('/profile', authMiddleware, getProfile)
router.get('/:id', getUser)
router.post('/change-avatar', authMiddleware, upload.single('avatar'), changeAvatar)
router.patch('/edit-user', authMiddleware, editUser)


export default router