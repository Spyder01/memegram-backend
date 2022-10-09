import { hash, compare } from "bcrypt";


const HASH = async (password: string): Promise<string> => {
    const salt = await hash(password, 10);
    return salt;
}

const COMPARE = async (password: string, hash: string): Promise<boolean> => {
    const isValid = await compare(password, hash);
    return isValid;
}

export {
    HASH,
    COMPARE
}