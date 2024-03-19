import Post, { categories } from "../models/postModel";
import User from "../models/userModel";
import { v4 as uuid } from "uuid";
import HttpError from "../models/errorModel";
import { type Request, type Response, type NextFunction } from "express";
import { deleteObject, getObjectSignedUrl, uploadObject } from "../utils/s3";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, category, description } = req.body
        const file = req.file
        if(!title || !category || !description || !file || file.fieldname !== 'thumbnail'){
            return next(new HttpError('Por favor llene todos los campos', 400))
        }

        if(!categories.includes(category)){
            return next(new HttpError('Categoría no válida', 400))
        }
        
        if(description.trim().length < 50){
            return next(new HttpError('El contenido debe tener al menos 50 caracteres', 400))
        }

        if(file.size > 1000000){
            return next(new HttpError('El archivo es demasiado grande', 400))
        }

        const user = User.findById(req?.user?.id)
        if(!user){
            return next(new HttpError('Usuario no encontrado', 404))
        }
        const filename = `${uuid()}-${file.originalname}`
        const response = await uploadObject(file.buffer, filename, file.mimetype)
        if(!response){
            return next(new HttpError('Error al subir la imagen', 500))
        }
        const post = await Post.create({
            title,
            category,
            description,
            creator: req?.user?.id,
            thumbnail: filename
        })
        if(!post){
            await deleteObject(filename)
            return next(new HttpError('Error al crear la publicación', 500))
        }

        return res.sendStatus(201)

    } catch (error) {
        return next(new HttpError('Error al crear la publicación', 500))
    }
}

export const getPosts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1}).select('-__v')
        if(!posts){
            return next(new HttpError('No hay publicaciones', 404))
        }
        for(let post of posts){
            post.thumbnail = await getObjectSignedUrl(post.thumbnail)
        }
        return res.json(posts)
    } catch (error) {
        return next(new HttpError('Error al obtener publicaciones', 500))
    }
}