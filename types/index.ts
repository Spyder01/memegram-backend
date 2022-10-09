import { Request as req } from "express"


interface User {
    username: string;
    id: string;
}

 interface Request extends req {
  user: User;
}

export type {
    Request,
    User as UserType
}