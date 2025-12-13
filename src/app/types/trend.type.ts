import {
  TrendMaturityStage,
  PredictionAccuracy
} from "@prisma/client";

export interface CreateTrendInput {
  title: string;
  mentions24h: number;
}

export {
  TrendMaturityStage,
  PredictionAccuracy
};
