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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
const authMiddleware = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Authorization = (req.headers.authorization || req.headers.Authorization);
    if (Authorization && Authorization.startsWith('Bearer')) {
        const token = Authorization.split(' ')[1];
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new errorModel_1.default('El toke no es válido', 401));
            }
            req.user = decoded;
            next();
        });
    }
    else {
        return next(new errorModel_1.default('No estás autenticado', 401));
    }
});
exports.default = authMiddleware;
//# sourceMappingURL=authMiddlware.js.map