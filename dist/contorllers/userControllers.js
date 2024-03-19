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
exports.getAuthors = exports.getUser = exports.getProfile = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
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
    try {
        const user = yield userModel_1.default.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password -__v');
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
        res.status(200).json(authors);
    }
    catch (error) {
        return next(new errorModel_1.default('Error al obtener autores', 500));
    }
});
exports.getAuthors = getAuthors;
//# sourceMappingURL=userControllers.js.map