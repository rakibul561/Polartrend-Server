import bcrypt from "bcryptjs"; 
import { prisma } from "../../../lib/prisma";
import { Request } from "express";



const createUser = async (payload:any) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const userData = {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        role: payload.role || "USER"
    };

    const result = await prisma.user.create({
        data: userData,
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return result;
};



const getSingleUser = async (userId:string) => {
    
    console.log("User ID in service:", userId);

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    })


    return user;

}


const getAllUsers = async () =>{
    const user = await prisma.user.findMany({});
    const totalUser = await prisma.user.count();
    return {
       meta:{
        total: totalUser
       },
       data:{
        user
       }
    }
}



const UserUpdateProfile = async (userId:string, payload:any) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: payload
    });

    return updatedUser;
}




export const UserService = {
    createUser,
    getSingleUser,
    getAllUsers,
    UserUpdateProfile
};