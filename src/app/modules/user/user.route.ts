
import auth from "../../middleware/auth";
import { UserController } from "./user.controller";
import express from "express";
import { UserRole } from "./userConstance";
import validateRequest from "../../middleware/validateRequest";
import { registerUserSchema } from "./user.validation";

    

const router = express.Router();

router.post("/register",validateRequest(registerUserSchema) ,UserController.createUser); 
router.get("/me",UserController.getSingleUser);
router.get("/",auth(UserRole.ADMIN),UserController.getAllUsers);
router.patch("/profile" ,UserController.UserUpdateProfile);

export const UserRoutes = router;
