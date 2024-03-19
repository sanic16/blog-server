import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connect } from 'mongoose'
import { errorHandler, notFound } from './middleware/errorMiddleware'
import userRoutes from './routes/userRoutes'
import multer from 'multer'


const app = express()
dotenv.config()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage})

app.use(cors({
    credentials: true,
    origin: '*'
}))


app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use('/api/users', userRoutes)


app.use(notFound)
app.use(errorHandler)



connect(process.env.MONGO_URI as string).then(
    () =>{
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`)
        })
    }
).catch(error => console.log(error))