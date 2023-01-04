import db from '@/lib/firestoreAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import store from 'store2';
import {getAuthorizationToken} from '@/lib/utils';
import { User, Message } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {
    async function clearUsers(roomid: string) {
        const snapshot = await db.collection('chat').doc(roomid).collection('users').get();
        if (snapshot.empty) {
            return;
        }  
    
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
           batch.delete(doc.ref);
        });
        await batch.commit(); 
    }
    
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
    
    async function clearChatRoom(roomid: string) {
        const docMsg = await db.collection('chat').doc(roomid).collection('recent').doc('addmessage').get();
        if (docMsg.exists) {
            if (docMsg.data()?.sentAt > (Timestamp.now().toMillis() - 12 * 60 * 60 * 1000)){
                return '';
            }
        }
        const docUser = await db.collection('chat').doc(roomid).collection('recent').doc('adduser').get();
        if (docUser.exists) {
            if (docUser.data()?.createdAt > (Timestamp.now().toMillis() - 12 * 60 * 60 * 1000)){
                return '';
            }
        }
        
        if (!docMsg.exists && !docUser.exists){
            return 'EmptyRoom';
        }
    
        await clearUsers(roomid);
        await clearMessages(roomid);
        await clearTypingUser(roomid);
        await clearRecent(roomid);
        return 'EmptyRoom';
    }
    
    try {
        if (req.method === 'POST'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            let {user} = req.body;
            let userID = user.id;
            delete user.id;
            const response = await clearChatRoom(roomid as string);
            const userRef = db.collection('chat').doc(roomid as string).collection('users');
            if (response == 'EmptyRoom') {
                const result = await userRef.doc(userID).set({...user, createdAt: Timestamp.now().toMillis()});
            }else{
                const doc = await userRef.doc(userID).get();
                if (!doc.exists) {
                    const result = await userRef.doc(userID).set({...user, createdAt: Timestamp.now().toMillis()});
                }else{
                    const result = await userRef.add({...user, createdAt: Timestamp.now().toMillis()});
                    userID = result.id;                   
                }
            }  
            const addedUser = {key: 'adduser', id: userID, ...user, createdAt: Timestamp.now().toMillis()};
            await db.collection('chat').doc(roomid as string).collection('recent').doc('adduser').set(addedUser);
            //Check the recent removed user
            const storeKey = 'removeuser_' + roomid;
            const removedUser = JSON.parse(store(storeKey));
            if (removedUser?.id === userID){
                store.remove(storeKey);
                await db.collection('chat').doc(roomid as string).collection('recent').doc('removeuser').delete();
            }
            res.status(200).json({id: userID, ...user});
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error adding users:', e);
        res.status(400).end();
    }
}

