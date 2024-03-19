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
exports.editUser = exports.changeAvatar = exports.getAuthors = exports.getUser = exports.getProfile = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const s3_1 = require("../utils/s3");
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, password2 } = req.body;
        console.log(req.body);
        if (!name || !email || !password || !password2) {
            return next(new errorModel_1.default('Por favor llene todos los campos', 400));
        }
        const newEmail = email.toLowerCase();
        const emailExists = yield userModel_1.default.findOne({ email: newEmail });
        if (emailExists) {
            return next(new errorModel_1.default('El correo ya existe', 400));
        }
        if (password.trim().length < 6) {
            return next(new errorModel_1.default('La contraseña debe tener al menos 6 caracteres', 400));
        }
        if (password !== password2) {
            return next(new errorModel_1.default('Las contraseñas no coinciden', 400));
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        yield userModel_1.default.create({
            name,
            email: newEmail,
            password: hashedPassword
        });
        res.sendStatus(201);
    }
    catch (error) {
        console.log(error);
        return next(new errorModel_1.default('Error al registrar nuevo usuario', 500));
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim())) {
            return next(new errorModel_1.default('Por favor llene todos los campos', 401));
        }
        const userEmail = email.toLowerCase();
        const user = yield userModel_1.default.findOne({ email: userEmail });
        if (!user) {
            return next(new errorModel_1.default('Credenciales incorrectas', 401));
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return next(new errorModel_1.default('Credenciales incorrectas', 401));
        }
        const { _id: id, name } = user;
        const token = jsonwebtoken_1.default.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, id, name });
    }
    catch (error) {
        return next(new errorModel_1.default('Error al iniciar sesión', 500));
    }
});
exports.loginUser = loginUser;
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('hi');
    try {
        const user = yield userModel_1.default.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password -__v');
        if (!user) {
            return next(new errorModel_1.default('Usuario no encontrado', 404));
        }
        user.avatar = yield (0, s3_1.getObjectSignedUrl)(user.avatar);
        if (!user.avatar) {
            return next(new errorModel_1.default('Error al obtener el avatar', 500));
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener el perfil', 500));
    }
});
exports.getProfile = getProfile;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield userModel_1.default.findById(id).select('-password -__v');
        if (!user) {
            return next(new errorModel_1.default('Usuario no encontrado', 404));
        }
        user.avatar = yield (0, s3_1.getObjectSignedUrl)(user.avatar);
        if (!user.avatar) {
            return next(new errorModel_1.default('Error al obtener el avatar', 500));
        }
        res.status(200).json(user);
    }
    catch (error) {
        return next(new errorModel_1.default('Error al procesar la solicitud', 500));
    }
});
exports.getUser = getUser;
const getAuthors = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authors = yield userModel_1.default.find().select('-password').select('-__v');
        for (let author of authors) {
            author.avatar = yield (0, s3_1.getObjectSignedUrl)(author.avatar);
        }
        res.status(200).json(authors);
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener autores', 500));
    }
});
exports.getAuthors = getAuthors;
const changeAvatar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const user = yield userModel_1.default.findById((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!user) {
            return next(new errorModel_1.default('Usuario no encontrado', 404));
        }
        const file = req.file;
        if (!file || file.fieldname !== 'avatar') {
            return next(new errorModel_1.default('Por favor seleccione una imagen', 400));
        }
        if (file.size > 500000) {
            return next(new errorModel_1.default('La imagen es muy grande', 400));
        }
        const filename = `${(0, uuid_1.v4)()}-${file.originalname}`;
        const response = yield (0, s3_1.uploadObject)(file.buffer, filename, file.mimetype);
        if (!response) {
            return next(new errorModel_1.default('Error al cambiar el avatar', 500));
        }
        if (user.avatar && user.avatar !== 'default.jpg') {
            yield (0, s3_1.deleteObject)(user.avatar);
        }
        const updatedAvatar = yield userModel_1.default.findByIdAndUpdate((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id, { avatar: filename }, { new: true });
        if (!updatedAvatar) {
            yield (0, s3_1.deleteObject)(filename);
            return next(new errorModel_1.default('Error al cambiar el avatar', 500));
        }
        res.sendStatus(204);
    }
    catch (error) {
        return next(new errorModel_1.default('Error al cambiar el avatar', 500));
    }
});
exports.changeAvatar = changeAvatar;
const editUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
            return next(new errorModel_1.default('Por favor llene todos los campos', 400));
        }
        const user = yield userModel_1.default.findById((_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d.id);
        if (!user) {
            return next(new errorModel_1.default('Usuario no encontrado', 404));
        }
        const emailExists = yield userModel_1.default.findOne({ email });
        if (emailExists && emailExists.email !== user.email) {
            return next(new errorModel_1.default('El correo ya existe', 400));
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new errorModel_1.default('Contraseña incorrecta', 400));
        }
        if (newPassword.trim().length < 6) {
            return next(new errorModel_1.default('La contraseña debe tener al menos 6 caracteres', 400));
        }
        if (newPassword !== confirmNewPassword) {
            return next(new errorModel_1.default('Las contraseñas no coinciden', 400));
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
        const updatedUser = yield userModel_1.default.findByIdAndUpdate((_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e.id, { name, email, password: hashedPassword }, { new: true });
        if (!updatedUser) {
            return next(new errorModel_1.default('Error al actualizar el usuario', 500));
        }
        res.sendStatus(204);
    }
    catch (error) {
        return next(new errorModel_1.default('Error al actualizar el usuario', 500));
    }
});
exports.editUser = editUser;
//# sourceMappingURL=userControllers.js.map