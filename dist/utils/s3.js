"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectSignedUrl = exports.deleteObject = exports.uploadObject = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_s3_2 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new client_s3_1.S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});
const uploadObject = (fileBuffer, fileName, mimetype) => {
    const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype
    };
    return s3.send(new client_s3_2.PutObjectCommand(uploadParams));
};
exports.uploadObject = uploadObject;
const deleteObject = (fileName) => {
    const deleteParams = {
        Bucket: bucketName,
        Key: fileName
    };
    return s3.send(new client_s3_2.DeleteObjectCommand(deleteParams));
};
exports.deleteObject = deleteObject;
const getObjectSignedUrl = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: bucketName,
        Key: filename
    };
    const command = new client_s3_2.GetObjectCommand(params);
    const seconds = 300;
    const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: seconds });
    return url;
});
exports.getObjectSignedUrl = getObjectSignedUrl;
//# sourceMappingURL=s3.js.map