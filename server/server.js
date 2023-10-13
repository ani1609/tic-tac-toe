const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer();
const io = new Server(server, 
{
    cors: 
    {
        origin: "http://localhost:3001", // Replace with your React app's origin
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => 
{
    console.log("A user connected");

    // Store the joined rooms for each user
    const joinedRooms = [];

    // Handle create room
    socket.on("create_room", (roomId) => 
    {
        // Leave all previously joined rooms
        for (const room of joinedRooms) {
        socket.leave(room);
        }
        socket.join(roomId);
        joinedRooms.push(roomId);
        console.log(`User created and joined a room: ${roomId}`);
    });

    // Handle new user joining room
    socket.on("join_room", (data) => 
    {
        // Leave all previously joined rooms
        for (const room of joinedRooms) 
        {
            socket.leave(room);
            console.log(`User left a room: ${room}`);
        }
        socket.join(data.roomId);
        joinedRooms.push(data.roomId);
        socket.broadcast.to(data.roomId).emit("join_room", 
        {
            user: data.user,
            message: "has joined this room.",
        });
        console.log(`User joined a room: ${data.roomId}`);
    });

    // Handle send message
    socket.on("send_message", (data) => 
    {
        console.log("emitting message");
        io.to(data.roomId).emit("receive_message", { data: data });
    });

    socket.on("disconnect", () => 
    {
        console.log("A user disconnected");
        // Leave all previously joined rooms when a user disconnects
        for (const room of joinedRooms) {
        socket.leave(room);
        }
    });
});


server.listen(3000, () => 
{
    console.log('server is listening on port 3000');
});
