"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const m_1 = __importDefault(require("../utils/m"));
const postController_1 = require("../contorllers/postController");
const authMiddlware_1 = __importDefault(require("../middleware/authMiddlware"));
const router = (0, express_1.Router)();
router.route('/').get(postController_1.getPosts).post(authMiddlware_1.default, m_1.default.single('thumbnail'), postController_1.createPost);
//# sourceMappingURL=postRoutes.js.map