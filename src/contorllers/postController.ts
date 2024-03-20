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

        const user = await User.findById(req?.user?.id)
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
        user.posts += 1
        await user.save()
        
        return res.status(201).json({
            message: 'Post creado con éxito'
        })

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
        return res.json({
            posts: posts
        })
    } catch (error) {
        return next(new HttpError('Error al obtener publicaciones', 500))
    }
}

export const getPost = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const post = await Post.findById(id).select('-__v')
        if(!post){
            return next(new HttpError('Publicación no encontrada', 404))
        }
        post.thumbnail = await getObjectSignedUrl(post.thumbnail)
        return res.status(200).json({
            post
        })
    } catch (error) {
        return next(new HttpError('Error al obtener la publicación', 500))
    }
}

export const getCatPosts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: category } = req.params
        const posts = await Post.find({ category }).select('-__v').sort({ updatedAt: -1})
        if(!posts){
            return next(new HttpError('No hay publicaciones en esta categoría', 404))
        }
        for(let post of posts){
            post.thumbnail = await getObjectSignedUrl(post.thumbnail)
        }
        return res.status(200).json({
            posts
        })

    } catch (error) {
        return next(new HttpError('Error al obtener publicaciones', 500)) 
    }
}

export const getUserPosts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: creator } = req.params
        const posts = await Post.find({ creator }).select('-__v').sort({ updatedAt: -1})
        if(!posts){
            return next(new HttpError('No hay publicaciones', 404))
        }
        for(let post of posts){
            post.thumbnail = await getObjectSignedUrl(post.thumbnail)
        }
        return res.status(200).json({
            posts
        })
    } catch (error) {
        return next(new HttpError('Error al obtener publicaciones', 500))
    }
}

export const deletePost = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {id } = req.params
        const user = await User.findById(req?.user?.id)
        if(!user){
            return next(new HttpError('Usuario no encontrado', 404))
        }
        const post = await Post.findById(id)
        if(!post){
            return next(new HttpError('Publicación no encontrada', 404))
        }
        if(req?.user?.id !== post?.creator.toString()){
            return next(new HttpError('No tienes permiso para realizar esta acción', 403))
        }
        const response = await deleteObject(post.thumbnail)
        if(!response){
            return next(new HttpError('Error al eliminar la publicación', 500))
        }
        const deletedPost = await Post.findByIdAndDelete(id)
        if(!deletedPost){
            return next(new HttpError('Error al eliminar la publicación', 500))
        }
        user.posts -= 1
        await user.save()
        return res.status(200).json({
            message: 'Publicación eliminada con éxito'
        })
    } catch (error) {
        return next(new HttpError('Error al eliminar la publicación', 500)) 
    }
}

export const editPost = async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { title, category, description } = req.body

    if(!title || !category || !description){
        return next(new HttpError('Por favor llene todos los campos', 400))
    }

    if(!categories.includes(category)){
        return next(new HttpError('Categoría no válida', 400))
    }
    if(description.trim().length < 50){
        return next(new HttpError('El contenido debe tener al menos 50 caracteres', 400))
    }
    if(title.trim().length < 3){
        return next(new HttpError('El título debe tener al menos 3 caracteres', 400))
    }

   

    try {
        const post = await Post.findById(id)
        if(!post){
            return next(new HttpError('Publicación no encontrada', 404))
        }
    
        if(req?.user?.id !== post?.creator.toString()){
            return next(new HttpError('No tienes permiso para realizar esta acción', 403))
        }
    
        post.title = title
        post.category = category
        post.description = description
        if(req.file){
            if(req.file.fieldname !== 'thumbnail'){
                return next(new HttpError('Por favor seleccione una imagen', 400))
            }
            const file = req.file
            if(file.size > 1000000){
                return next(new HttpError('El archivo es demasiado grande', 400))
            }
            const filename = `${uuid()}-${file.originalname}`
            const response = await uploadObject(file.buffer, filename, file.mimetype)
            if(!response){
                return next(new HttpError('Error al subir la imagen', 500))
            }
            const deleted = await deleteObject(post.thumbnail)
            if(!deleted){
                return next(new HttpError('Error al editar la publicación', 500))
            }
            post.thumbnail = filename            
        }
        await post.save()
        return res.status(200).json({
            message: 'Publicación editada con éxito'
        })
    } catch (error) {
        return next(new HttpError('Error al editar la publicación', 500)) 
    }
}