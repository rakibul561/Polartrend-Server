import express from "express";
import { TrendController } from "./trend.controller";


const router = express.Router();

router.get("/stats", TrendController.getStats);


router.get("/trending", TrendController.getTrendingNow);

router.get("/search", TrendController.searchTrends);

router.get("/fast-forward/month", TrendController.getTrendsOneMonthAgo);

router.get("/", TrendController.getTrendsWithFilters);

router.get("/:id", TrendController.getSingleTrend);

router.get("/:id/similar", TrendController.getSimilarTrends);



router.post("/rebuild-similar", TrendController.rebuildAllSimilarTrends); 

router.post("/", TrendController.createTrend); 

router.put("/:id", TrendController.updateTrend); 

router.delete("/:id", TrendController.deleteTrend); 

router.post("/:id/mentions", TrendController.addRedditMentions);

export const TrendRoutes = router;
