import {Router, Response, Request} from 'express';
import User from '../../models/User';
import {HASH} from '../../utils';
import { ValidateCredentials } from './utils';

const app = Router ();

app.post ('/', async (req:Request, res:Response) => {
    const {username, password} = req.body;
    const hash = await HASH (password);

    const validate = ValidateCredentials (res, username, password);

    if (validate !== true) 
        return validate;

    try {

        const userExists = await User.findOne ({
            username
        });

        if (userExists) {
            return res.status (404).json ({
                error: 'Username already exists'
            });
        }

        const user = await User.create ({
            username,
            password: hash
        });

        res.status (201).json ({
            message: 'User created successfully',
            username
        });
    } catch (err) {
        console.log (err);
        res.status (500).json ({
            message: 'Internal server error'
        });
    }
})

export default app;