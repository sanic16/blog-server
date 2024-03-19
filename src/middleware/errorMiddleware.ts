import { NextFunction, Request, Response } from "express";
import HttpError from "../models/errorModel";

// Unsupported (404) routes
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error) 
}

// Middlware to handle Errors
export const errorHandler = (error: HttpError, _req: Request, res: Response, next: NextFunction) => {
    if(res.headersSent){
        return next(error)
    }
    res.status(error.code || 500).json({
        message: error.message || 'An unknown error occurred'
    })
}