import User from "../models/userModel";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import HttpError from "../models/errorModel";
import { type Request, type Response, type NextFunction } from 'express'
type UserInput = {
    name?: string;
    email?: string;
    password?: string;
    password2?: string;
}
export const registerUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, password2 }: UserInput = req.body
        console.log(req.body)
        if(!name || !email || !password || !password2){
            return next(new HttpError('Por favor llene todos los campos', 400))
        }
        const newEmail = email.toLowerCase()
        const emailExists = await User.findOne({ email: newEmail})

        if(emailExists){
            return next(new HttpError('El correo ya existe', 400))
        }

        if(password.trim().length < 6){
            return next(new HttpError('La contraseña debe tener al menos 6 caracteres', 400))
        }

        if(password !== password2){
            return next(new HttpError('Las contraseñas no coinciden', 400))
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        await User.create({
            name,
            email: newEmail,
            password: hashedPassword
        })
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        return next(new HttpError('Error al registrar nuevo usuario', 500))
    }
}

export const loginUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password }: UserInput = req.body
        if(!email?.trim() || !password?.trim()){
            return next(new HttpError('Por favor llene todos los campos', 401))
        }

        const userEmail = email.toLowerCase()

        const user = await User.findOne({ email: userEmail })

        if(!user){
            return next(new HttpError('Credenciales incorrectas', 401))
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return next(new HttpError('Credenciales incorrectas', 401))
        }

        const { _id: id, name } = user
        const token = jwt.sign({ id, name}, process.env.JWT_SECRET as string, { expiresIn: '1d'})

        res.status(200).json({token, id, name})

    } catch (error) {
        return next(new HttpError('Error al iniciar sesión', 500))
    }
}

export const getProfile = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req?.user?.id).select('-password -__v')
        return res.status(200).json(user)
    } catch (error) {
        return next(new HttpError('Error al obtener el perfil', 500))
    }
}

export const getUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select('-password -__v')
        if(!user){
            return next(new HttpError('Usuario no encontrado', 404))
        } 

        res.status(200).json(user)        
    } catch (error) {
        return next(new HttpError('Error al procesar la solicitud', 500))
    }
}

export const getAuthors = async(_req: Request, res: Response, next: NextFunction) => {
    try {
        const authors = await User.find().select('-password').select('-__v')
        res.status(200).json(authors)
    } catch (error) {
        return next(new HttpError('Error al obtener autores', 500))
    }
}