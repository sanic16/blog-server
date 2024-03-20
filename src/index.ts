import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connect } from 'mongoose'
import { errorHandler, notFound } from './middleware/errorMiddleware'
import userRoutes from './routes/userRoutes'
import postRoutes from './routes/postRoutes'
import path from 'path'


const app = express()
dotenv.config()


app.use(cors({
    credentials: true,
    origin: "https://blog.juliosanic.tech"
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

app.use(express.static(path.join(__dirname, '/react')))
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '/react/index.html'))
    console.log(path.join(__dirname, '/react/index.html'))
})

app.use(notFound)
app.use(errorHandler)



connect(process.env.MONGO_URI as string).then(
    () =>{
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`)
        })
    }
).catch(error => console.log(error))