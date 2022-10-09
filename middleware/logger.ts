import type { Response } from "express";
import type { Request } from "../types";
import Logger from "../models/Logger";

const logger = async (req:Request|any, res:Response, next:Function) => {
    const {username} = req.user;

    const endpoint = req.originalUrl;

    console.log (`${username} is trying to access ${endpoint}`);
    try {
        await Logger.create ({
            user: username,
            endpoint
        })
    } catch (err) {
        console.log (err);
        res.status (500).json ({
            message: 'Internal server error'
        });
    }
    next ();
}

export default logger;