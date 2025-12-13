import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.services";


const createUser = catchAsync(async (req: Request, res: Response) => {

    const body = req.body;
    const result = await UserService.createUser(body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully!",
        data: result
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {

   const decokdedUser = req.user;
    const result = await UserService.getSingleUser(decokdedUser.userId);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User retrieved successfully!",
        data: result
    });
});



const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const result = await UserService.getAllUsers();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully!",
        data: result
    });
}   );



const UserUpdateProfile = catchAsync(async (req: Request, res: Response) => {

    const decokdedUser = req.user;
    const body = req.body;  
    const result = await UserService.UserUpdateProfile(decokdedUser.userId, body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile updated successfully!",
        data: result
    });
});




export const UserController = {
    createUser,
    getSingleUser,
    getAllUsers,
    UserUpdateProfile
};
