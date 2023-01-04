import db from '@/lib/firestoreAdmin';
import store from 'store2';
import {getAuthorizationToken} from '@/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            const { user } = req.body;
            const userID = user.id;
            delete user.id;
            const result = await db.collection('chat').doc(roomid as string).collection('typingusers').doc(userID).set(user);            
            const addedUser = {key: 'addtypinguser', id: userID, ...user};
            await db.collection('chat').doc(roomid as string).collection('recent').doc('addtypinguser').set(addedUser);
            //Check the recent removed typinguser
            const storeKey = 'removetypinguser_' + roomid;
            const removedUser = JSON.parse(store(storeKey));
            if (removedUser?.id === userID){
                store.remove(storeKey);
                await db.collection('chat').doc(roomid as string).collection('recent').doc('removetypinguser').delete();
            }
            res.status(200).json({status: 'OK'});
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error adding typingusers:', e);
        res.status(400).end();
    }
}

