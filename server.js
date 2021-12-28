/*--------------------------------------------------*
 * This file contains the server-side logic.        *
 * It is responsible for:                           *
 *  - Creating the game                             *
 *  - Joining the game                              *
 *  - Communication to client                       *
 *--------------------------------------------------*/

// Importing required modules
const express = require('express');
const socketio = require('socket.io');
const http = require('http');

// Storing port number
const PORT = process.env.PORT || 3000;

// Initial app setup
const app = express();

// Serving static files from public directory
app.use(express.static('public'));

// Setting up server
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}!`)
});

// Initializing socket
const io = socketio(server);

// Dictionary of names of Player 1s and room IDs
let playerOnes = {};

// Opening a socket connection and setting up event listeners
io.on('connection', socket => {
    console.log("New client connected!");

    // If a client disconnects
    socket.on('disconnect', () => { console.log("Client disconnected!"); });

    // TODO: Handle user disconnecting from game

    // Creating a new game
    socket.on('create-game', data => {
        const roomID = makeid(5); // Generating a random room ID
        socket.join(roomID);
        playerOnes[roomID] = data.playerName;
        socket.emit("game-created", { playerName: data.playerName, roomID: roomID });
    });

    // Joining an existing room
    socket.on('join-game', data => {
        socket.join(data.roomID);
        socket.emit('player-one-joined', { playerName: playerOnes[data.roomID], roomID: data.roomID });
        socket.to(data.roomID).emit('player-two-joined', { playerName: data.playerName, roomID: data.roomID });
    });
});

//----------UTILITY FUNCTIONS----------//

// Function that generates a random room ID
function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
}