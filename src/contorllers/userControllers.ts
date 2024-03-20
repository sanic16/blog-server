import User from "../models/userModel";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import HttpError from "../models/errorModel";
import { type Request, type Response, type NextFunction } from 'express'
import upload from "../utils/m";
import { deleteObject, getObjectSignedUrl, uploadObject } from "../utils/s3";

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
        res.status(201).json({message: 'Usuario registrado con éxito'})
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
    console.log('hi')
    try {
        const user = await User.findById(req?.user?.id).select('-password -__v')
        if(!user){
            return next(new HttpError('Usuario no encontrado', 404))
        }
        user.avatar = await getObjectSignedUrl(user.avatar)
        if(!user.avatar){
            return next(new HttpError('Error al obtener el avatar', 500))
        }
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
        user.avatar = await getObjectSignedUrl(user.avatar)
        if(!user.avatar){
            return next(new HttpError('Error al obtener el avatar', 500))
        }
        res.status(200).json(user)        
    } catch (error) {
        return next(new HttpError('Error al procesar la solicitud', 500))
    }
}

export const getAuthors = async(_req: Request, res: Response, next: NextFunction) => {
    try {
        const authors = await User.find().select('-password').select('-__v')
        for(let author of authors){
            author.avatar = await getObjectSignedUrl(author.avatar) 
        }
        res.status(200).json(authors)
    } catch (error) {
        return next(new HttpError('Error al obtener autores', 500))
    }
}

export const changeAvatar = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req?.user?.id)
        if(!user){
            return next(new HttpError('Usuario no encontrado', 404))
        }
        const file = req.file
        if(!file || file.fieldname !== 'avatar' ){
            return next(new HttpError('Por favor seleccione una imagen', 400))
        }

        if(file.size > 500000){
            return next(new HttpError('La imagen es muy grande', 400))
        }        
        const filename = `${uuid()}-${file.originalname}`
        const response = await uploadObject(file.buffer, filename, file.mimetype)
        if(!response){
            return next(new HttpError('Error al cambiar el avatar', 500))
        }
        if(user.avatar && user.avatar !== 'default.jpg'){
            await deleteObject(user.avatar)
        }

        const updatedAvatar = await User.findByIdAndUpdate(req?.user?.id, { avatar: filename}, { new: true })
        if(!updatedAvatar){
            await deleteObject(filename)
            return next(new HttpError('Error al cambiar el avatar', 500))
        }
        
        res.status(204).json({message: 'Avatar cambiado con éxito'})
        
    } catch (error) {
        return next(new HttpError('Error al cambiar el avatar', 500))
    }
}

export const editUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body
        if(!name || !email || !currentPassword || !newPassword || !confirmNewPassword){
            return next(new HttpError('Por favor llene todos los campos', 400))
        } 
        const user = await User.findById(req?.user?.id)
        if(!user){
            return next(new HttpError('Usuario no encontrado', 404))
        }

        const emailExists = await User.findOne({email})
        if(emailExists && emailExists.email !== user.email){
            return next(new HttpError('El correo ya existe', 400))
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if(!isMatch){
            return next(new HttpError('Contraseña incorrecta', 400))
        }

        if(newPassword.trim().length < 6){
            return next(new HttpError('La contraseña debe tener al menos 6 caracteres', 400))
        }

        if(newPassword !== confirmNewPassword){
            return next(new HttpError('Las contraseñas no coinciden', 400))
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        const updatedUser = await User.findByIdAndUpdate(req?.user?.id, { name, email, password: hashedPassword}, { new: true})
        if(!updatedUser){
            return next(new HttpError('Error al actualizar el usuario', 500))
        }
        res.sendStatus(204)
    } catch (error) {
        return next(new HttpError('Error al actualizar el usuario', 500))
    }
}