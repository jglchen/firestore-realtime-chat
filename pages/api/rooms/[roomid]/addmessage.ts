import db from '@/lib/firestoreAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import {getAuthorizationToken} from '@/lib/utils';
import { Message } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<Message>) {
    try {
        if (req.method === 'POST'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            const {user, msgbody} = req.body;
            const publiccode = user.publiccode;
            delete user.publiccode;
            const messageBody = {user, body: msgbody, sentAt: Timestamp.now().toMillis(), publiccode };
            const result = await db.collection('chat').doc(roomid as string).collection('messages').add(messageBody);
            await db.collection('chat').doc(roomid as string).collection('recent').doc('addmessage').set({key: 'addmessage', id: result.id, ...messageBody});
            delete messageBody.publiccode;
            res.status(200).json({id: result.id, ...messageBody});
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error sending message:', e);
        res.status(400).end();
    }
}    

export default handler;
