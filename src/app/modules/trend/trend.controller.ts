

import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TrendService } from "./trend.services";


const createTrend = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TrendService.createTrend(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Trend created successfully",
      data: result
    });
  }
);


const getAllTrends = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TrendService.getAllTrends();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trends retrieved successfully",
      data: result
    });
  }
);


const getSingleTrend = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TrendService.getSingleTrend(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trend retrieved successfully",
      data: result
    });
  }
);


const getTrendsOneMonthAgo = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TrendService.getTrendsOneMonthAgo();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "1-month-old trends retrieved successfully",
      data: result
    });
  }
);


const searchTrends = catchAsync(
  async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Search query is required",
        data: null
      });
    }

    const result = await TrendService.searchTrends(q);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Search results retrieved successfully",
      data: result
    });
  }
);


const getSimilarTrends = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const result = await TrendService.getSimilarTrends(id, limit);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Similar trends retrieved successfully",
      data: result
    });
  }
);


const addRedditMentions = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { mentions } = req.body;

    const result = await TrendService.addRedditMentions(id, mentions);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Reddit mentions added successfully",
      data: result
    });
  }
);


const updateTrend = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TrendService.updateTrend(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trend updated successfully",
      data: result
    });
  }
);


const deleteTrend = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TrendService.deleteTrend(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trend deleted successfully",
      data: result
    });
  }
);

const getTrendsWithFilters = catchAsync(
  async (req: Request, res: Response) => {
    const { maturityStage, accuracyStatus, limit, offset } = req.query;

    const parsedLimit = limit ? parseInt(limit as string) : 20;
    const parsedOffset = offset ? parseInt(offset as string) : 0;

    const result = await TrendService.getTrendsWithFilters({
      maturityStage: maturityStage as string,
      accuracyStatus: accuracyStatus as string,
      limit: parsedLimit,
      offset: parsedOffset
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
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
  }
);


const rebuildAllSimilarTrends = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TrendService.rebuildAllSimilarTrends();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: result
    });
  }
);


const getTrendingNow = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;

    const result = await TrendService.getTrendingNow(limit);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trending topics retrieved successfully",
      data: result
    });
  }
);


const getStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TrendService.getStats();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Statistics retrieved successfully",
      data: result
    });
  }
);

export const TrendController = {
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

