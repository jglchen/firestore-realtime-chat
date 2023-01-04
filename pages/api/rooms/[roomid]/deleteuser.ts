import db from '@/lib/firestoreAdmin';
import store from 'store2';
import {getAuthorizationToken} from '@/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    async function clearMessages(roomid: string) {
        const snapshot = await db.collection('chat').doc(roomid).collection('messages').get();
        if (snapshot.empty) {
            return;
        }  
    
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
           batch.delete(doc.ref);
        });
        await batch.commit(); 
    }

    async function clearTypingUser(roomid: string) {
        const snapshot = await db.collection('chat').doc(roomid).collection('typingusers').get();
        if (snapshot.empty) {
            return;
        }  
    
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
           batch.delete(doc.ref);
        });
        await batch.commit(); 
    }

    async function clearRecent(roomid: string) {
        const snapshot = await db.collection('chat').doc(roomid).collection('recent').get();
        if (snapshot.empty) {
            return;
        }  
    
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
           batch.delete(doc.ref);
        });
        await batch.commit(); 

        store.clear();
    }

    try {
        if (req.method === 'DELETE'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid, userid } = req.query;
            const userRef = db.collection('chat').doc(roomid as string).collection('users');
            await userRef.doc(userid as string).delete();
 
            //Check if collection of users is empty
            const snapshotUser = await userRef.get();
            if (snapshotUser.empty) {
                await clearMessages(roomid as string);
                await clearTypingUser(roomid as string);
                await clearRecent(roomid as string);
            }else{
                const removeUser = {key: 'removeuser', id: userid, publiccode: process.env.NEXT_PUBLIC_PUBLIC_CODE};
                await db.collection('chat').doc(roomid as string).collection('recent').doc('removeuser').set(removeUser);
                const storeKey = 'removeuser_' + roomid;
                store(storeKey, JSON.stringify(removeUser));
            }
            res.status(200).json({status: 'OK'});
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error deleting users:', e);
        res.status(400).end();
    }
}

