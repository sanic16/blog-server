"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.editPost = exports.deletePost = exports.getUserPosts = exports.getCatPosts = exports.getPost = exports.getPosts = exports.createPost = void 0;
const postModel_1 = __importStar(require("../models/postModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const uuid_1 = require("uuid");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const s3_1 = require("../utils/s3");
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, category, description } = req.body;
        const file = req.file;
        if (!title || !category || !description || !file || file.fieldname !== 'thumbnail') {
            return next(new errorModel_1.default('Por favor llene todos los campos', 400));
        }
        if (!postModel_1.categories.includes(category)) {
            return next(new errorModel_1.default('Categoría no válida', 400));
        }
        if (description.trim().length < 50) {
            return next(new errorModel_1.default('El contenido debe tener al menos 50 caracteres', 400));
        }
        if (file.size > 1000000) {
            return next(new errorModel_1.default('El archivo es demasiado grande', 400));
        }
        const user = yield userModel_1.default.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            return next(new errorModel_1.default('Usuario no encontrado', 404));
        }
        const filename = `${(0, uuid_1.v4)()}-${file.originalname}`;
        const response = yield (0, s3_1.uploadObject)(file.buffer, filename, file.mimetype);
        if (!response) {
            return next(new errorModel_1.default('Error al subir la imagen', 500));
        }
        const post = yield postModel_1.default.create({
            title,
            category,
            description,
            creator: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id,
            thumbnail: filename
        });
        if (!post) {
            yield (0, s3_1.deleteObject)(filename);
            return next(new errorModel_1.default('Error al crear la publicación', 500));
        }
        user.posts += 1;
        yield user.save();
        return res.status(201).json({
            message: 'Post creado con éxito'
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al crear la publicación', 500));
    }
});
exports.createPost = createPost;
const getPosts = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield postModel_1.default.find().sort({ createdAt: -1 }).select('-__v');
        if (!posts) {
            return next(new errorModel_1.default('No hay publicaciones', 404));
        }
        for (let post of posts) {
            post.thumbnail = yield (0, s3_1.getObjectSignedUrl)(post.thumbnail);
        }
        return res.json({
            posts: posts
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener publicaciones', 500));
    }
});
exports.getPosts = getPosts;
const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const post = yield postModel_1.default.findById(id).select('-__v');
        if (!post) {
            return next(new errorModel_1.default('Publicación no encontrada', 404));
        }
        post.thumbnail = yield (0, s3_1.getObjectSignedUrl)(post.thumbnail);
        return res.status(200).json({
            post
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener la publicación', 500));
    }
});
exports.getPost = getPost;
const getCatPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: category } = req.params;
        const posts = yield postModel_1.default.find({ category }).select('-__v').sort({ updatedAt: -1 });
        if (!posts) {
            return next(new errorModel_1.default('No hay publicaciones en esta categoría', 404));
        }
        for (let post of posts) {
            post.thumbnail = yield (0, s3_1.getObjectSignedUrl)(post.thumbnail);
        }
        return res.status(200).json({
            posts
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener publicaciones', 500));
    }
});
exports.getCatPosts = getCatPosts;
const getUserPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: creator } = req.params;
        const posts = yield postModel_1.default.find({ creator }).select('-__v').sort({ updatedAt: -1 });
        if (!posts) {
            return next(new errorModel_1.default('No hay publicaciones', 404));
        }
        for (let post of posts) {
            post.thumbnail = yield (0, s3_1.getObjectSignedUrl)(post.thumbnail);
        }
        return res.status(200).json({
            posts
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener publicaciones', 500));
    }
});
exports.getUserPosts = getUserPosts;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const { id } = req.params;
        const user = yield userModel_1.default.findById((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id);
        if (!user) {
            return next(new errorModel_1.default('Usuario no encontrado', 404));
        }
        const post = yield postModel_1.default.findById(id);
        if (!post) {
            return next(new errorModel_1.default('Publicación no encontrada', 404));
        }
        if (((_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d.id) !== (post === null || post === void 0 ? void 0 : post.creator.toString())) {
            return next(new errorModel_1.default('No tienes permiso para realizar esta acción', 403));
        }
        const response = yield (0, s3_1.deleteObject)(post.thumbnail);
        if (!response) {
            return next(new errorModel_1.default('Error al eliminar la publicación', 500));
        }
        const deletedPost = yield postModel_1.default.findByIdAndDelete(id);
        if (!deletedPost) {
            return next(new errorModel_1.default('Error al eliminar la publicación', 500));
        }
        return res.status(200).json({
            message: 'Publicación eliminada con éxito'
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al eliminar la publicación', 500));
    }
});
exports.deletePost = deletePost;
const editPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { id } = req.params;
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
        return next(new errorModel_1.default('Por favor llene todos los campos', 400));
    }
    if (!postModel_1.categories.includes(category)) {
        return next(new errorModel_1.default('Categoría no válida', 400));
    }
    if (description.trim().length < 50) {
        return next(new errorModel_1.default('El contenido debe tener al menos 50 caracteres', 400));
    }
    if (title.trim().length < 10) {
        return next(new errorModel_1.default('El título debe tener al menos 10 caracteres', 400));
    }
    try {
        const post = yield postModel_1.default.findById(id);
        if (!post) {
            return next(new errorModel_1.default('Publicación no encontrada', 404));
        }
        if (((_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e.id) !== (post === null || post === void 0 ? void 0 : post.creator.toString())) {
            return next(new errorModel_1.default('No tienes permiso para realizar esta acción', 403));
        }
        post.title = title;
        post.category = category;
        post.description = description;
        if (req.file) {
            if (req.file.fieldname !== 'thumbnail') {
                return next(new errorModel_1.default('Por favor seleccione una imagen', 400));
            }
            const file = req.file;
            if (file.size > 1000000) {
                return next(new errorModel_1.default('El archivo es demasiado grande', 400));
            }
            const filename = `${(0, uuid_1.v4)()}-${file.originalname}`;
            const response = yield (0, s3_1.uploadObject)(file.buffer, filename, file.mimetype);
            if (!response) {
                return next(new errorModel_1.default('Error al subir la imagen', 500));
            }
            const deleted = yield (0, s3_1.deleteObject)(post.thumbnail);
            if (!deleted) {
                return next(new errorModel_1.default('Error al editar la publicación', 500));
            }
            post.thumbnail = filename;
        }
        yield post.save();
        return res.status(200).json({
            message: 'Publicación editada con éxito'
        });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al editar la publicación', 500));
    }
});
exports.editPost = editPost;
//# sourceMappingURL=postController.js.map