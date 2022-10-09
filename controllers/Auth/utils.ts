import type { Response } from "express"

const ValidateCredentials = (res:Response, username:string, password:string) => {
    const regexUser = /^[a-zA-Z0-9._]{3,20}$/;
    const regexPass = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    if (!regexUser.test (username)) {
        return res.status (400).json ({
            error: 'Username must be between 3 and 20 characters and can only contain letters, numbers, and underscores.'
        });

    } else if (!regexPass.test (password)) {
        return res.status (400).json ({
            error: 'Password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        });
    }

    return true;
}

export {
    ValidateCredentials
}