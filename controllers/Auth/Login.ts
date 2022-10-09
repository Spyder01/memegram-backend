import {Router, Response, Request} from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import {COMPARE} from '../../utils';
import { ValidateCredentials } from './utils';

const app = Router ();


app.post ('/', async (req:Request, res:Response) => {
    const {username, password} = req.body;

    const validate = ValidateCredentials (res, username, password);

    if (validate !== true)
        return validate;

    try {
        const user = await User.findOne ({
            username
        });

        if (!user) {
            return res.status (404).json ({
                error: 'User not found'
            });
        }

        const isValid = await COMPARE (password, user.password);

        if (!isValid) {
            return res.status (401).json ({
                error: 'Password is incorrect'
            });
        }

        const token = jwt.sign ({
            username: user.username,
            id: user._id
        }, process.env.SECRET||'secret');

        res.status (200).json ({
            message: 'User logged in successfully',
            token
        });

    } catch (err) {
        console.log (err);
        res.status (500).json ({
            message: 'Internal server error'
        });
    }
})

export default app;