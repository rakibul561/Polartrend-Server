import { NextFunction, Request, Response } from "express"

import  httpStatus  from 'http-status';
import ApiError from "../error/AppError";
import { jwtHelper } from "../helpers/jwtHelper";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED,"You are not authorized!")
            }

              const secret = process.env.JWT_ACCESS_SECRET as string;

            const verifyUser = jwtHelper.verifyToken(token, secret);

            req.user = verifyUser;

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError(httpStatus.UNAUTHORIZED,"You are not authorized!")
            }

            next();
        }
        catch (err) {
            next(err)
        }
    }
}

export default auth;