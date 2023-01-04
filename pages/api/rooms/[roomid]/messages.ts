import db from '@/lib/firestoreAdmin';
import { Message } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<Message[]>) {
    try {
        const { roomid } = req.query;
        const messages: Message[] = [];
        const msgsRef = db.collection('chat').doc(roomid as string).collection('messages').orderBy('sentAt'); 
        const snapshot = await msgsRef.get();       
        snapshot.forEach(doc => {
            const message = {id: doc.id, ...doc.data()};
            delete (message as Message).publiccode; 
            messages.push(message as Message);
        });
        res.status(200).json(messages);
    } catch (err) {    
        res.status(400).end();
    }
}    

export default handler;
