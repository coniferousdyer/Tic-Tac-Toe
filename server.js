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
const game = require('./game');

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

// Dictionary of games in progress with room IDs
let games = {};

// Opening a socket connection and setting up event listeners
io.on('connection', socket => {
    console.log("New client connected!");

    // If a client disconnects
    socket.on('disconnect', () => {
        console.log("Client disconnected!");
        let roomID = getRoomID(socket.id);

        if (roomID)
            updateGame(socket.id, roomID);
    });

    // Creating a new game
    socket.on('create-game', data => {
        const roomID = makeid(5); // Generating a random room ID
        socket.join(roomID);
        let player = new game.Player(socket.id, data.playerName, "X");
        games[roomID] = new game.Game(player, null, roomID, 1);

        socket.emit("game-created", { playerName: data.playerName, roomID: roomID });
    });

    // Joining an existing room
    socket.on('join-game', data => {
        // Checking if room with entered ID exists
        if (!(data.roomID in games)) {
            socket.emit("alert-user", `Room with ID ${data.roomID} does not exist.`);
            return;
        }

        // Checking if room is full
        if (games[data.roomID].playerTwo) {
            socket.emit("alert-user", `Room with ID ${data.roomID} is full.`);
            return;
        }

        socket.join(data.roomID);
        games[data.roomID].resetGame();
        games[data.roomID].playerTwo = new game.Player(socket.id, data.playerName, "O");

        socket.emit('player-one-joined', { playerName: games[data.roomID].playerOne.name, roomID: data.roomID });
        socket.to(data.roomID).emit('player-two-joined', { playerName: data.playerName, roomID: data.roomID });
    });

    // When a player plays a turn
    socket.on('play-turn', data => {
        // If it is player 1's turn
        if (games[data.roomID].turn == 1 && games[data.roomID].playerOne.socketID == data.socketID) {
            games[data.roomID].markBoard("X", data.cellID);
            games[data.roomID].turn = 2;

            // Checking if game is over
            if (games[data.roomID].checkWin(games[data.roomID].playerOne.symbol, data.cellID)) {
                socket.to(data.roomID).emit('game-over', {
                    winner: games[data.roomID].playerOne.name,
                    roomID: data.roomID,
                    socketID: data.socketID
                });

                socket.emit('game-over', {
                    winner: games[data.roomID].playerOne.name,
                    roomID: data.roomID,
                    socketID: data.socketID
                });

                return;
            }
            else if (games[data.roomID].checkDraw()) {
                socket.to(data.roomID).emit('game-over', { winner: "Draw", roomID: data.roomID });
                socket.emit('game-over', { winner: "Draw", roomID: data.roomID });
                return;
            }

            socket.to(data.roomID).emit('turn-played', {
                turn: 2,
                cellID: data.cellID,
                symbol: games[data.roomID].playerOne.symbol
            });

            socket.emit('turn-played', {
                turn: 2,
                cellID: data.cellID,
                symbol: games[data.roomID].playerOne.symbol
            });
        }
        // If it is player 2's turn
        else if (games[data.roomID].turn == 2 && games[data.roomID].playerTwo.socketID == data.socketID) {
            games[data.roomID].markBoard("O", data.cellID);
            games[data.roomID].turn = 1;

            // Checking if game is over
            if (games[data.roomID].checkWin(games[data.roomID].playerTwo.symbol, data.cellID)) {
                socket.to(data.roomID).emit('game-over', {
                    winner: games[data.roomID].playerTwo.name,
                    roomID: data.roomID,
                    socketID: data.socketID
                });

                socket.emit('game-over', {
                    winner: games[data.roomID].playerTwo.name,
                    roomID: data.roomID,
                    socketID: data.socketID
                });

                return;
            }
            else if (games[data.roomID].checkDraw()) {
                socket.to(data.roomID).emit('game-over', { winner: "Draw", roomID: data.roomID });
                socket.emit('game-over', { winner: "Draw", roomID: data.roomID });
                return;
            }

            socket.to(data.roomID).emit('turn-played', {
                turn: 1,
                cellID: data.cellID,
                symbol: games[data.roomID].playerTwo.symbol
            });

            socket.emit('turn-played', {
                turn: 1,
                cellID: data.cellID,
                symbol: games[data.roomID].playerTwo.symbol
            });
        }
        else
            socket.emit("alert-user", "It is not your turn!");
    });

    // When a player goes back to the main menu
    socket.on("back-to-main-menu", () => {
        let roomID = getRoomID(socket.id);
        socket.leave(roomID);
        updateGame(socket.id, roomID);

        socket.emit("return-to-main-menu");
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

// Function that gets the room ID of a socket
function getRoomID(socketID) {
    return Object.keys(games).find(
        roomID => (games[roomID].playerOne && games[roomID].playerOne.socketID == socketID)
            || (games[roomID].playerTwo && games[roomID].playerTwo.socketID == socketID)
    );
}

// Function that performs end-game cleanup
function updateGame(socketID, roomID) {
    if (games[roomID].playerOne && games[roomID].playerTwo) {
        if (games[roomID].playerOne.socketID == socketID) {
            games[roomID].playerOne.socketID = games[roomID].playerTwo.socketID;
            games[roomID].playerOne.name = games[roomID].playerTwo.name;
            games[roomID].playerTwo = null;
        }
        else
            games[roomID].playerTwo = null;
    }
    else if (games[roomID].playerOne)
        delete games[roomID];
}