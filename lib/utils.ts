import { NextApiRequest } from 'next'

export function getAuthorizationToken(req: NextApiRequest){
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if(typeof bearerHeader === 'undefined'){
        return '';
    }
    //split the space at the bearer
    const bearer = bearerHeader.split(' ');
    if (bearer.length <2){
        return '';
    }
    return bearer[1]; 
}
