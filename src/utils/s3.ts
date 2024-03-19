import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from 'dotenv'
dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME as string;
const region = process.env.AWS_BUCKET_REGION as string;
const accessKeyId = process.env.AWS_ACCESS_KEY as string;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;

const s3 = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
})

export const uploadObject = (fileBuffer: Buffer, fileName: string, mimetype: string) => {
    const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype
    }

    return s3.send(new PutObjectCommand(uploadParams))
}

export const deleteObject = (fileName: string) => {
    const deleteParams = {
        Bucket: bucketName,
        Key: fileName
    }

    return s3.send(new DeleteObjectCommand(deleteParams))
}

export const getObjectSignedUrl = async(filename: string) => {
    const params = {
        Bucket: bucketName,
        Key: filename
    }

    const command = new GetObjectCommand(params)
    const seconds = 300
    const url = await getSignedUrl(s3, command, { expiresIn: seconds })
    return url
} 
