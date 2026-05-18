"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
// routes
const auth_1 = __importDefault(require("./routes/cms/auth/auth"));
const media_1 = __importDefault(require("./routes/cms/media/media"));
const users_1 = __importDefault(require("./routes/cms/users/users"));
const service_1 = __importDefault(require("./routes/cms/service/service"));
const industry_1 = __importDefault(require("./routes/cms/industries/industry"));
const categories_1 = __importDefault(require("./routes/cms/articles/categories"));
const tags_1 = __importDefault(require("./routes/cms/articles/tags"));
const articles_1 = __importDefault(require("./routes/cms/articles/articles"));
// import event from "./routes/cms/events/events";
const caseStudies_1 = __importDefault(require("./routes/cms/caseStudies/caseStudies"));
const categoryPublic_1 = __importDefault(require("./routes/public/article/categoryPublic"));
const tagPublic_1 = __importDefault(require("./routes/public/article/tagPublic"));
const articlePublic_1 = __importDefault(require("./routes/public/article/articlePublic"));
// import eventPublic from "./routes/public/event/event";
const caseStudyPublic_1 = __importDefault(require("./routes/public/caseStudies/caseStudyPublic"));
const file_1 = __importDefault(require("./routes/file/file"));
const scheduler_1 = require("./services/scheduler");
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    override: true,
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS
const cmsOrigins = [
    process.env.CMS_FRONTEND_URL,
    process.env.CMS_FRONTEND_PROD_URL,
    `http://localhost:${PORT}`,
    // `http://192.168.1.4:3000`,
].filter(Boolean);
const publicOrigins = [
    process.env.PUBLIC_FRONTEND_URL || "http://localhost:3002",
    process.env.PUBLIC_FRONTEND_PROD_URL,
    process.env.PUBLIC_FRONTEND_URL_PREVIEW_PROD,
].filter(Boolean);
const cmsCors = (0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (cmsOrigins.includes(origin))
            return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
});
const publicCors = (0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (publicOrigins.includes(origin))
            return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
});
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api-docs/cms", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customSiteTitle: "API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
}));
// CMS
app.use("/api/cms", cmsCors, auth_1.default);
app.use("/api/cms", cmsCors, users_1.default);
app.use("/api/cms", cmsCors, media_1.default);
app.use("/api/cms", cmsCors, service_1.default);
app.use("/api/cms", cmsCors, industry_1.default);
app.use("/api/cms", cmsCors, categories_1.default);
app.use("/api/cms", cmsCors, tags_1.default);
app.use("/api/cms", cmsCors, articles_1.default);
// app.use("/api/cms", cmsCors, event);
app.use("/api/cms", cmsCors, caseStudies_1.default);
// Public
app.use("/api/public", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});
app.use("/api/public", publicCors, categoryPublic_1.default);
app.use("/api/public", publicCors, tagPublic_1.default);
app.use("/api/public", publicCors, articlePublic_1.default);
// app.use("/api/public", publicCors, eventPublic);
app.use("/api/public", publicCors, caseStudyPublic_1.default);
// File
app.use("/uploads", file_1.default);
scheduler_1.ContentSchedulerService.startScheduler();
exports.default = app;
//# sourceMappingURL=app.js.map