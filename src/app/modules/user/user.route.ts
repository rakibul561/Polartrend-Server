
import auth from "../../middleware/auth";
import { UserController } from "./user.controller";
import express from "express";
import { UserRole } from "./userConstance";

    

const router = express.Router();

router.post("/register",UserController.createUser); 
router.get("/me",UserController.getSingleUser);
router.get("/",auth(UserRole.ADMIN),UserController.getAllUsers);
router.patch("/profile" ,UserController.UserUpdateProfile);

export const UserRoutes = router;