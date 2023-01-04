export interface User {
    id: string;
    name: string;
    picture: string;
    email?: string;
    publiccode?: string;
    createdAt?: number;
}

export interface Message {
    id: string;
    body: string;
    publiccode?: string;
    sentAt: number;
    user?: User;
}    

