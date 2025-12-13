
import auth from "../../middleware/auth";
import { UserController } from "./user.controller";
import express from "express";

    

const router = express.Router();

router.post("/register",UserController.createUser); 
router.get("/me",UserController.getSingleUser);
router.get("/",UserController.getAllUsers);
router.patch("/profile" ,UserController.UserUpdateProfile);

export const UserRoutes = router;