"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("mongoose");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
dotenv_1.default.config();
if (process.env.NODE_ENV === 'development') {
    app.use((0, cors_1.default)({
        credentials: true,
        origin: '*'
    }));
}
else {
    app.use((0, cors_1.default)({
        credentials: true,
        origin: "blog.juliosanic.tech"
    }));
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/users', userRoutes_1.default);
app.use('/api/posts', postRoutes_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, '/react')));
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/react/index.html'));
    console.log(path_1.default.join(__dirname, '/react/index.html'));
});
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
(0, mongoose_1.connect)(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
}).catch(error => console.log(error));
//# sourceMappingURL=index.js.map