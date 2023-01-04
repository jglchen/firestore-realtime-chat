import db from '@/lib/firestoreAdmin';
import { User } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<User[]>) {
    try {
        const { roomid } = req.query;
        const typingusers: User[] = [];
        const usersRef = db.collection('chat').doc(roomid as string).collection('typingusers'); 
        const snapshot = await usersRef.get();       
        snapshot.forEach(doc => {
            const typinguser = {id: doc.id, ...doc.data()};
            delete (typinguser as User).publiccode;
            typingusers.push(typinguser as User);
        });
        res.status(200).json(typingusers);
    } catch (err) {    
        res.status(400).end();
    }
}    

export default handler;

