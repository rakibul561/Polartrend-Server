import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { jwtHelper } from "../../helpers/jwtHelper";


const login = async ( payload: { email: string; password: string } ) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: { email: payload.email }
    })


    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);

    const accessToken = jwtHelper.generateToken(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET as string,
        "10d"
    );
    const refreshToken = jwtHelper.generateToken(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_REFRESH_SECRET as string,
        "90d"
    );

   
     return {
        accessToken,
        refreshToken,
        
     }
}




export const AuthService = {
    login,
    
}