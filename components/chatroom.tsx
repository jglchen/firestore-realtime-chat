import { useEffect, useState, useRef, FormEvent } from "react";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import axios from "axios";
import db from '@/lib/firestore';
import apiconfig from "@/lib/apiconfig";
import useUsers from '@/lib/useusers';
import useMessages from '@/lib/usemessages';
import useTypingUsers from '@/lib/usetypingusers';
import useTyping from "@/lib/usetyping";
import ChatMessage from "./chatmessage";
import NewMessageForm from "./newmessageform";
import TypingMessage from "./typingmessage";
import Users from "./users";
import UserAvatar from "./useravatar";
import UserLogOut from "./userlogout";
import styles from '@/styles/chatroom.module.css';
import { User, Message } from '@/lib/types';

interface PropsType {
    roomid: string;
    user: User;
    userLogout: () => void;
}

export default function ChatRoom({roomid, user, userLogout}: PropsType) {
   const {data: users, mutate: usersMutate} = useUsers(roomid as string);
   const {data: messages, mutate: messagesMutate} = useMessages(roomid as string);
   const {data: typingUsers, mutate: typingUsersMutate} = useTypingUsers(roomid as string);
   const [newMessage, setNewMessage] = useState<string>("");
   const scrollTarget = useRef(null);
   const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();
   const [timeDiff, setTimeDiff] = useState(0);
 
   useEffect(() => {
      const q = query(collection(db, "chat", roomid, "recent"), where("key", "==", "adduser"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         querySnapshot.forEach((doc) => {
            usersMutate((users: User[]) => {
               const exists = users?.find(
                  ({ id }) => id === doc.data().id
               );
               if (exists){
                   return users;
               }
               const addedUser = doc.data();
               delete addedUser.key;
               delete addedUser.publiccode;
               if (!users){
                  return [addedUser];
               }
               return [...users, addedUser];
            }, false);
         });
      });
      return () => {
         unsubscribe();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[]);

   useEffect(() => {
      const q = query(collection(db, "chat", roomid, "recent"), where("key", "==", "removeuser"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         querySnapshot.forEach((doc) => {
            usersMutate((users: User[]) => {
               return users?.filter(
                  ({ id }) => id !== doc.data().id
               );
            }, false);
         });
      });
      return () => {
         unsubscribe();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[]);
   
   useEffect(() => {
      const q = query(collection(db, "chat", roomid, "recent"), where("key", "==", "addtypinguser"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         querySnapshot.forEach((doc) => {
            typingUsersMutate((typingUsers : User[]) => {
               const exists = typingUsers?.find(
                  ({ id }) => id === doc.data().id
               );
               if (exists){
                   return typingUsers;
               }
               const addedUser = doc.data();
               delete addedUser.key;
               delete addedUser.publiccode;
               if (!typingUsers){
                  return [addedUser];
               }
               return [...typingUsers, addedUser];
            }, false);
         });
      });
      return () => {
         unsubscribe();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[]);

   useEffect(() => {
      const q = query(collection(db, "chat", roomid, "recent"), where("key", "==", "removetypinguser"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         querySnapshot.forEach((doc) => {
            typingUsersMutate((typingUsers: User[]) => {
               return typingUsers?.filter(
                  ({ id }) => id !== doc.data().id
               );
            }, false);
         });
      });
      return () => {
         unsubscribe();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[]);

   useEffect(() => {
      const q = query(collection(db, "chat", roomid, "recent"), where("key", "==", "addmessage"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         querySnapshot.forEach((doc) => {
            messagesMutate((messages: Message[]) => {
               const exists = messages?.find(
                  ({ id }) => id === doc.data().id
               );
               if (exists){
                   return messages;
               }
               const addedMessage = doc.data();
               delete addedMessage.key;
               delete addedMessage.publiccode;
               if (!messages){
                  return [addedMessage];
               }
               const messagesData = messages.filter(item => 
                  item.id !== 'temp');
               return [...messagesData, addedMessage];           
            }, false);
         });
      });
      return () => {
         unsubscribe();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[]);

   const sendMessage = async (messageBody: string) => {
      if (!messageBody) return;
      try {
         messagesMutate((messages: Message[]) => {
            const message = {id: 'temp', user, body: messageBody, sentAt: Date.now()};
            if (!messages){
               return [message];
            }
            return [...messages, message];
         }, false);
         const {data} = await axios.post(`/api/rooms/${roomid}/addmessage`, { user, msgbody: messageBody}, apiconfig);
         messagesMutate((messages: Message[]) => {
            const exists = messages?.find(
               ({ id }) => id === data.id
            );
            if (exists){
                return messages;
            }
            
            if (!messages){
               return [data];
            }
            const messagesData = messages.filter(item => 
               item.id !== 'temp');
            return [...messagesData, data];           
         }, false);
      }catch(err){
         //---//
      }
   };
   
   const startTypingMessage = () => {
      if (!user) return;
      axios.post(`/api/rooms/${roomid}/addtypinguser`, { user }, apiconfig);
   };
 
   const stopTypingMessage = () => {
      if (!user) return;
      axios.delete(`/api/rooms/${roomid}/stoptyping?userid=${user.id}`, apiconfig);
   };
   
   const handleNewMessageChange = (event: FormEvent<HTMLInputElement>) => {
      setNewMessage(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
   };
 
   const handleSendMessage = (event: FormEvent<HTMLInputElement>) => {
      event.preventDefault();
      cancelTyping();
      sendMessage(newMessage);
      setNewMessage("");
   };

   useEffect(() => {
      if (isTyping) startTypingMessage();
      else stopTypingMessage();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isTyping]);

   useEffect(() => {
      axios.get('/api/currenttime')
      .then(({data}) => {
         setTimeDiff(Date.now() - data.current);
      })
      .catch((error) => {
      });
   },[]);
   
   useEffect(() => {
      if (scrollTarget.current) {
         (scrollTarget.current as any).scrollIntoView({ behavior: 'smooth' });
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[messages?.length + typingUsers?.length]);
    
   return (
         <div className={styles.chatRoomContainer}>
            <div className={styles.chatRoomTopBar}>
               <h1>Room: {roomid}</h1>
               {user && 
               <>
               <UserAvatar user={user}></UserAvatar>
               <UserLogOut userLogout={userLogout} />
               </>
               }
            </div>
            <Users users={users?.filter((item: User) => item.id !== user?.id)}></Users>
            <div className={styles.messagesContainer}>
               <ol className={styles.messagesList}>
                  {messages?.map((message: Message) => 
                   {
                     message.sentAt += timeDiff;
                     return (
                        <li key={message.id}>
                           <ChatMessage message={message} ownedByCurrentUser={message.user?.id === user?.id ? true: false} ></ChatMessage>
                        </li>
                     )
                   }
                  )}
                  {typingUsers?.filter((item: User) => item.id != user?.id).map((user: User) => (
                    <li key={user.id}>
                      <TypingMessage user={user}></TypingMessage>
                    </li>
                  ))}
               </ol>
               <div ref={scrollTarget}></div>
            </div>
            <NewMessageForm
               newMessage={newMessage}
               handleNewMessageChange={handleNewMessageChange}
               handleStartTyping={startTyping}
               handleStopTyping={stopTyping}
               handleSendMessage={handleSendMessage}
            ></NewMessageForm>
         </div>
   );

} 
