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
exports.TrendController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const trend_services_1 = require("./trend.services");
const createTrend = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield trend_services_1.TrendService.createTrend(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Trend created successfully",
        data: result
    });
}));
const getAllTrends = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield trend_services_1.TrendService.getAllTrends();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Trends retrieved successfully",
        data: result
    });
}));
const getSingleTrend = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield trend_services_1.TrendService.getSingleTrend(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Trend retrieved successfully",
        data: result
    });
}));
const getTrendsOneMonthAgo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield trend_services_1.TrendService.getTrendsOneMonthAgo();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "1-month-old trends retrieved successfully",
        data: result
    });
}));
const searchTrends = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Search query is required",
            data: null
        });
    }
    const result = yield trend_services_1.TrendService.searchTrends(q);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Search results retrieved successfully",
        data: result
    });
}));
const getSimilarTrends = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const result = yield trend_services_1.TrendService.getSimilarTrends(id, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Similar trends retrieved successfully",
        data: result
    });
}));
const addRedditMentions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { mentions } = req.body;
    const result = yield trend_services_1.TrendService.addRedditMentions(id, mentions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Reddit mentions added successfully",
        data: result
    });
}));
const updateTrend = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield trend_services_1.TrendService.updateTrend(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Trend updated successfully",
        data: result
    });
}));
const deleteTrend = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield trend_services_1.TrendService.deleteTrend(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Trend deleted successfully",
        data: result
    });
}));
const getTrendsWithFilters = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { maturityStage, accuracyStatus, limit, offset } = req.query;
    const parsedLimit = limit ? parseInt(limit) : 20;
    const parsedOffset = offset ? parseInt(offset) : 0;
    const result = yield trend_services_1.TrendService.getTrendsWithFilters({
        maturityStage: maturityStage,
        accuracyStatus: accuracyStatus,
        limit: parsedLimit,
        offset: parsedOffset
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Filtered trends retrieved successfully",
        data: result.data,
        meta: {
            page: Math.floor(parsedOffset / parsedLimit) + 1,
            limit: result.meta.limit,
            total: result.meta.total,
            totalPages: Math.ceil(result.meta.total / parsedLimit)
        }
    });
}));
const rebuildAllSimilarTrends = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield trend_services_1.TrendService.rebuildAllSimilarTrends();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result
    });
}));
const getTrendingNow = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Number(req.query.limit) || 10;
    const result = yield trend_services_1.TrendService.getTrendingNow(limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Trending topics retrieved successfully",
        data: result
    });
}));
const getStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield trend_services_1.TrendService.getStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Statistics retrieved successfully",
        data: result
    });
}));
exports.TrendController = {
    createTrend,
    getAllTrends,
    getSingleTrend,
    getTrendsOneMonthAgo,
    searchTrends,
    getSimilarTrends,
    addRedditMentions,
    updateTrend,
    deleteTrend,
    getTrendsWithFilters,
    rebuildAllSimilarTrends,
    getTrendingNow,
    getStats
};
