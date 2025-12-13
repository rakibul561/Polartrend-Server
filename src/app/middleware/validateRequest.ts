import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ApiError from "../error/AppError";
import httpStatus from "http-status";

const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false
    });

    if (error) {
      const message = error.details
        .map(d => d.message)
        .join(", ");

      return next(
        new ApiError(httpStatus.BAD_REQUEST, message)
      );
    }

    next();
  };
};

export default validateRequest;
