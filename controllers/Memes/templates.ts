import { Response, Router } from "express";
import fetch from "node-fetch";
import type { Request } from "../../types";
import {auth, logger} from "../../middleware";

const app = Router ();

app.use (auth);
app.use (logger);

app.get ("/", async (req:Request | any, res:Response) => {
    
    try {
        const response = await fetch ("https://api.imgflip.com/get_memes");
        const Res = await response.json ();
        const {data} = await Res;
        const {memes:Memes} = data;
        const memes = {
            success: true,
            memes: Memes
        }

        res.status (200).json (memes);
    } catch (err) {
        console.log (err);
        res.status (500).json ({
            message: "Internal server error"
        });
    }
});

app.get ("/:id", async (req:Request | any, res:Response) => {
    const {id} = req.params;
    try {
        const response = await fetch ("https://api.imgflip.com/get_memes");
        const Res = await response.json ();
        const {data} = await Res;
        const {memes:Memes} = data;
        const meme = await Memes.find ((meme: { id: any; }) => meme.id === id);
        res.status (200).json ({
            success: true,
            meme
        });
    } catch (err) {
        console.log (err);
        res.status (500).json ({
            message: "Internal server error"
        });
    }
})

export default app;