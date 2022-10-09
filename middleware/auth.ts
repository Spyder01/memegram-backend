import type { Response } from "express";
import jwt from "jsonwebtoken";
import {Request} from '../types'
import User from "../models/User";


const auth = async (req:Request | any, res:Response, next:Function) => {
    const authHeader:string | undefined = req.headers.authorization;



    if (!authHeader) {
        return res.status (401).json ({
            error: 'No token, authorization denied'
        });
    }

    const token:string = authHeader.split (" ")[1];

    try {
        const decoded:any = jwt.verify (token, process.env.SECRET||'secret');

        const user = await User.findById (decoded.id);
        

        if (!user) {
            return res.status (404).json ({
                error: 'Invalid access token'
            });
        }

        req.user = {
            username: user.username,
            id: user._id
        };
    } catch (err) {
        console.log (err);
        return res.status (401).json ({
            error: 'Invalid access token'
    });
}
    next ();
}

export default auth;