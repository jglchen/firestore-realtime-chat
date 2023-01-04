import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Beforeunload } from 'react-beforeunload';
import Layout from "@/components/layout";
import ChatRoom from "@/components/chatroom";
import apiconfig from "@/lib/apiconfig";
import { User } from '@/lib/types';
import styles from '@/styles/home.module.css';

export default function Home() {
   const [roomName, setRoomName] = useState("");
   const [user, setUser] = useState<User | null>();

   const handleRoomNameChange = (event: FormEvent<HTMLInputElement>) => {
      setRoomName(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
   };

   async function joinChatRoom(){
      if (!roomName){
         return;
      }

      let result: any;
      do {
         const response = await axios.get("https://api.randomuser.me/");
         result = response.data.results[0];
      }
      while(!result.id.name && !result.id.value);      
      const userData = {
         id: `${result.id.name}_${result.id.value?.replace(/ /g, '-')}`,
         name: result.name.first,
         picture: result.picture.thumbnail,
         email: result.email,
         publiccode: process.env.NEXT_PUBLIC_PUBLIC_CODE,
      };
      setUser(userData);
      const {data} = await axios.post(`/api/rooms/${roomName}/adduser`, { user: {...userData} }, apiconfig);
      if (data.id !== user?.id){
         setUser(data);
      }
   }

   function userLogout(){
      if (user){
         axios.delete(`/api/rooms/${roomName}/deleteuser?userid=${encodeURIComponent(user?.id as string)}`, apiconfig);
         setUser(null);
      }
      setRoomName('');
   }
 
   return (
   <Beforeunload onBeforeunload={(event) => {event.preventDefault(); userLogout();}}>
      <Layout>
         <>
         {user &&
         <ChatRoom 
            roomid={roomName}
            user={user}
            userLogout={userLogout}
         />
         }
         {!user &&
         <div className={styles.homeContainer}>
            <h1 style={{textAlign: 'center'}}>Chat Applications with Cloud Firestore</h1>
            <div className={styles.mobileRemark}>
               React Native Expo Publish: <a href="https://exp.host/@jglchen/firestore-realtime-chat" target="_blank" rel="noreferrer">https://exp.host/@jglchen/firestore-realtime-chat</a>
            </div>
            <input
               type="text"
               placeholder="Room"
               value={roomName}
               onChange={handleRoomNameChange}
               className={styles.textInputField}
               />
            <div className={styles.enterRoomButton} onClick={() => joinChatRoom()}>
               Join room
            </div> 
            <div className={styles.remarkContainer}>
            We can successfully build a real-time chat application with <a href='https://nextjs.org/' target='_blank' rel='noreferrer'>Next.js</a> using <a href='https://socket.io/' target='_blank' rel='noreferrer'>Socket.IO</a>. The real-time communication however was found not to function well once the package is deployed to Vercel, which is a serverless platform. It is suggested by Vercel two main approaches to applying a real-time model to stateless serverless functions.
            <ol>
               <li>Serverless Functions have maximum execution limits and should respond as quickly as possible. They should not subscribe to data events. Instead, we need a client that subscribes to data events (such as <a href='https://ably.com/' target='_blank' rel='noreferrer'>Alby</a>, <a href='https://pusher.com/' target='_blank' rel='noreferrer'>Pusher</a>, etc.) and a serverless function that publishes new data.</li>
               <li>Rather than pushing data, we can fetch real-time data on-demand. For example, the Vercel dashboard delivers realtime updates using <a href='https://swr.vercel.app/' target='_blank' rel='noreferrer'>SWR</a>.</li>
            </ol>
            In this demonstration, we build a real-time chat application with <a href='https://firebase.google.com/products/firestore' target='_blank' rel='noreferrer'>Firebase Cloud FireStore</a>.
          </div>
         </div>
         }
         </>
      </Layout>
   </Beforeunload>   
   );
}    
