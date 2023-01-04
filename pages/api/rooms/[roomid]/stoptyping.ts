import db from '@/lib/firestoreAdmin';
import store from 'store2';
import {getAuthorizationToken} from '@/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'DELETE'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid, userid } = req.query;
            await db.collection('chat').doc(roomid as string).collection('typingusers').doc(userid as string).delete();
            const removeUser = {key: 'removetypinguser', id: userid, publiccode: process.env.NEXT_PUBLIC_PUBLIC_CODE};
            await db.collection('chat').doc(roomid as string).collection('recent').doc('removetypinguser').set(removeUser);
            const storeKey = 'removetypinguser_' + roomid;
            store(storeKey, JSON.stringify(removeUser));
            res.status(200).json({status: 'OK'});
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error sending message:', e);
        res.status(400).end();
    }
}

