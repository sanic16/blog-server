import jwt from 'jsonwebtoken'
import HttpError from '../models/errorModel'
import { type Request, type Response, type NextFunction } from 'express'

const authMiddleware = async(req: Request, _res: Response, next: NextFunction) => {
    const Authorization = (req.headers.authorization || req.headers.Authorization) as string
    if(Authorization && Authorization.startsWith('Bearer')){
        const token = Authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if(err){
                return next(new HttpError('El toke no es válido', 401))
            }
            req.user = decoded as { id: string, name: string}
            next()
        })
    }else{
        return next(new HttpError('No estás autenticado', 401))
    }
}

export default authMiddleware
