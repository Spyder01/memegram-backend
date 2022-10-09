import { Router, Response } from 'express';
import { Request } from '../../types';
import fetch from 'node-fetch';
import FormData from 'form-data';
import Meme from '../../models/Meme';
import User from '../../models/User';
import { auth, logger } from '../../middleware';



const app = Router();

app.use(auth);
app.use(logger);

interface CaptionType {
    text: string;
    boxNumber: number;
    font?: string;
    size?: string;
}

interface MemeType {
    id: string;
    title?: string;
    description?: string;
    captions: CaptionType[];
    category?: string;
}

app.post('/', async (req: Request | any & { body: MemeType }, res: Response) => {
    const {
        id,
        title,
        description,
        captions,
        category
    } = req.body;

    if (!id)
        return res.status(400).json({
            message: 'Meme id is required'
        });

    if (!captions)
        return res.status(400).json({
            message: 'Captions are required'
        });

    if (!captions.length)
        return res.status(400).json({
            message: 'Captions are required'
        });

    if (!captions.every((caption: CaptionType) => caption.text && caption.boxNumber))
        return res.status(400).json({ 
            message: 'Captions must have text and box number'
        });

    if (!captions.every((caption: CaptionType) => caption.boxNumber > 0 && caption.boxNumber < 11))
        return res.status(400).json({
            message: 'Box number must be between 1 and 10'
        });

    if (!captions.every((caption: CaptionType) => caption.text.length < 100))
        return res.status(400).json({
            message: 'Captions must be less than 100 characters'
        });

    if (title && title.length > 50)
        return res.status(400).json({
            message: 'Title must be less than 50 characters'
        });

    if (description && description.length > 200)
        return res.status(400).json({
            message: 'Description must be less than 200 characters'
        });




    try {
        const formdata: any = new FormData();
        formdata.append('template_id', id);
        formdata.append('username', process.env.MEME_API_USERNAME || 'username');
        formdata.append('password', process.env.MEME_API_PASSWORD || 'password');
        captions.forEach((caption: CaptionType) => {
            formdata.append(`boxes[${caption.boxNumber}][text]`, caption.text);
            if (caption.font)
                formdata.append('font', caption.font);
            if (caption.size)
                formdata.append('max_font_size', caption.size);
        });
        const response = await fetch(`https://api.imgflip.com/caption_image`, {
            method: 'POST',
            body: formdata
        });
        const Res = await response.json();
        const { data } = Res;
        const { url } = data;
        const meme = await Meme.create({
            title: title || 'untitled',
            description: description ? description : '',
            url,
            category: category ? category : '',
            captions,
            private: true,
            saved: false,
            posted: false,
            user_id: req.user.id
        });

        res.status(200).json({
            id: meme.id,
            success: true,
            meme: url,
            title: title || 'untitled',
            description: description ? description : '',
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Internal server error'
        });
    }


})

app.put ("/", async (req: Request | any & { body: MemeType }, res: Response) => {
    const {
        id, 
        operation
    } = req.body;

    if (!id)  {
        return res.status(400).json({
            message: 'Meme id is required'
        });
    }

    if (!operation) {
        return res.status(400).json({
            message: 'Operation is required'
        });
    }

    if (operation !== 'save' && operation !== 'unsave' && operation !== 'post') {
        return res.status(400).json({
            message: 'Operation must be save, unsave, or post'
        });
    }

    try {
        const meme = await Meme.findOne({
            where: {
                id
            }
        });

        if (!meme) {
            return res.status(404).json({
                message: 'Meme not found'
            });
        }

        if (operation === 'save') {
            await meme.update({
                saved: true
            });
        } else if (operation === 'unsave') {
            await meme.update({
                saved: false
            });
        } else if (operation === 'post') {
            await meme.update({
                posted: true,
                saved: true
            });
        }

        res.status(200).json({
            success: true
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Internal server error'
        });
    }
})

app.get('/', async (req: Request | any, res: Response) => {
    try {
        const memes = await Meme.find({ posted: true });
        

        if (!memes||!memes.length)
            return res.status(400).json({
                message: 'No memes found'
            });

        const response = await memes.map(async (meme: any) => {
            const {
                _id,
                title,
                description,
                url,
                category,
                captions,
                user_id,
               // id,
            } = meme;

            const user = await User.findById(user_id);
            const id = _id.toString ();
            return {
                id,
                title,
                description,
                url,
                category,
                captions,
                posted_by: user.username
            }
        });

        res.status(200).json({
            success: true,
            memes: await Promise.all(response)
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.get ('/profile', async (req: Request | any, res: Response) => {
   const {id} = req.user;
    try {
        const memes = await Meme.find({ user_id: id });

        if (!memes||!memes.length) {
            return res.status(400).json({
                message: 'No memes found'
            });
        }

        const response = await memes.map(async (meme: any) => {
            const {
                title,
                description,
                url,
                category,
                captions,
            } = meme;

            return {
                title,
                description,
                url,
                category,
                captions
            };
        });

        res.status(200).json({
            success: true,
            memes: await Promise.all(response)
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error'
        });
    } 
});

app.post ('/created', async (req: Request | any, res: Response) => {
    const {id} = req.user;
    const {id:memeID} = req.body;
    
    try {
        const meme = await Meme.findById(memeID);
        if (!meme)
            return res.status(400).json({
                message: 'Meme not found'
            });
        if (meme.user_id.toString () !== id.toString ()) {
          //  console.log(meme.user_id, id.toString ());
            return res.status(400).json({
                message: 'You do not have permission over this meme'
            });
        }
        const {
            title,
            description,
            url,
            category,
            captions,
        } = meme;

        res.status(200).json({
            success: true,
            meme: {
                id,
                title,
                description,
                url,
                category,
                captions
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }

})


export default app;
