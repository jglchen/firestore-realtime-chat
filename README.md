# Chat Applications with Cloud Firestore

We can successfully build a real-time chat application with [Next.js](https://nextjs.org/) using [Socket.IO](https://socket.io/). The real-time communication however was found not to function well once the package is deployed to Vercel, which is a serverless platform. It is suggested by Vercel two main approaches to applying a real-time model to stateless serverless functions.

1. Serverless Functions have maximum execution limits and should respond as quickly as possible. They should not subscribe to data events. Instead, we need a client that subscribes to data events (such as [Alby](https://ably.com/), [Pusher](https://pusher.com/), etc.) and a serverless function that publishes new data.
2. Rather than pushing data, we can fetch real-time data on-demand. For example, the Vercel dashboard delivers realtime updates using [SWR](https://swr.vercel.app/).

In this demonstration, we build a real-time chat application with [Firebase Cloud FireStore](https://firebase.google.com/products/firestore). 

**iOS** and **Android** mobile apps are also delivered. The apps are developed with **React Native**, anyone who is interested can test the development builds with [iOS Simulator Build](https://expo.dev/accounts/jglchen/projects/firestore-realtime-chat/builds/2c3cb3b7-2253-421f-9ab7-cb5ff98492b6) and [Android Internal Distribution Build](https://expo.dev/accounts/jglchen/projects/firestore-realtime-chat/builds/de478887-4f60-43d5-9911-d20d55627706). If the build storage link has expired, please go to [https://projects-jglchen.vercel.app/en/contact](https://projects-jglchen.vercel.app/en/contact) to request build files.

### [View the App](https://firestore-realtime-chat.vercel.app)
### [App GitHub](https://github.com/jglchen/firestore-realtime-chat)
### Docker: docker run -p 3000:3000 jglchen/firestore-realtime-chat
### [iOS Simulator Build](https://expo.dev/accounts/jglchen/projects/firestore-realtime-chat/builds/2c3cb3b7-2253-421f-9ab7-cb5ff98492b6)
### [Android Internal Distribution Build](https://expo.dev/accounts/jglchen/projects/firestore-realtime-chat/builds/de478887-4f60-43d5-9911-d20d55627706)
### [React Native GitHub](https://github.com/jglchen/firestore-realtime-chat-mobile)
