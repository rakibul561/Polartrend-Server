import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.services";


const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    const {accessToken, refreshToken} = result;

    res.cookie("accessToken", accessToken, {
        secure:true,
        httpOnly:true,
        sameSite:"none",
        maxAge: 1000 * 60 * 60
    })
    res.cookie("refreshToken", refreshToken, {
        secure:true,
        httpOnly:true,
        sameSite:"none",
        maxAge: 1000 * 60 * 60 * 24 * 90
    })
    


    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User loggedin successfully!",
        data: {
            result
        }
    })
})


const logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User logged out successfully!",
        data: null
    });
});







export const AuthController = {
    login,
    logout
}