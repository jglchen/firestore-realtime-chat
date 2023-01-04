import db from '@/lib/firestoreAdmin';
import { User } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<User[]>) {
    try {
        const { roomid } = req.query;
        const users: User[] = [];
        const usersRef = db.collection('chat').doc(roomid as string).collection('users'); 
        const snapshot = await usersRef.get();       
        snapshot.forEach(doc => {
            const user = {id: doc.id, ...doc.data()};
            delete (user as User).publiccode;
            users.push(user as User);
        });
        res.status(200).json(users);
    } catch (err) {    
        res.status(400).end();
    }
}    

export default handler;
