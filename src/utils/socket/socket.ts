const socketIo_Config = (io: any) => {
    let users: { userId: string; socketId: string }[] = [];
  
    io.on("connect", (socket: any) => {
      console.log("A client connected");
      io.emit("welcome", "this is server hi socket");
      socket.on("disconnect", () => {
        console.log("A client disconnected");
      });
  
      //on used for coming connection 
      // emit used for giving
      const removeUser = (socketId: string) => {
        users = users.filter((user) => user.socketId !== socketId);
      };
  
      const addUser = (userId: string, socketId: string) => {
        !users.some((user) => user.userId === userId) &&
          users.push({ userId, socketId });
      };
  
      const getUser = (userId: string) => {
        return users.find((user) => user.userId === userId);
      };
  
      //when connect
      socket.on("addUser", (userId: string) => {
        addUser(userId, socket.id);
        console.log(users)        
        io.emit("getUsers", users);
      });
  
      // send and get message
      socket.on(
        "sendMessage",
        ({
          senderId,
          receiverId,
          text,
          createdAt
        }: {
          senderId: string;
          receiverId: string;
          text: string;
          createdAt:Date;
        }) => {
            console.log(text, senderId, receiverId,createdAt);
            
          const user = getUser(receiverId);
          console.log("SEnding this message to ",user?.socketId)
          
          io.to(user?.socketId).emit("getMessage", {
            senderId,
            text,
            createdAt
          });
        }
      );
  
      // Listen for "typing" event from client
      socket.on(
        "typing",
        ({ senderId, recieverId }: { senderId: string; recieverId: string }) => {
          const user = getUser(recieverId);
          if (user) {
            io.to(user.socketId).emit("userTyping", { senderId });
          }
        }
      );
  
      // Listen for "stopTyping" event from client
      socket.on(
        "stopTyping",
        ({ senderId, recieverId }: { senderId: string; recieverId: string }) => {
          const user = getUser(recieverId);
          if (user) {
            io.to(user.socketId).emit("userStopTyping", { senderId });
          }
        }
      );
  
   
  
      // When disconnectec
      socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
      });
    });
  };
  
  export default socketIo_Config;