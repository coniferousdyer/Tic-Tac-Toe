/*--------------------------------------------------*
 * This file contains the client-side logic.        *
 * It is responsible for:                           *
 *  - HTML rendering                                *
 *  - Game UI setup                                 *
 *  - Communication to server                       *
 *--------------------------------------------------*/

const socket = io();

//----------DECLARING VARIABLES----------//

// References to the screens
const titleScreen = $("#title-screen");
const waitingScreen = $("#waiting-screen");
const gameScreen = $("#game-screen");

// Important global variables
let previousScreen = "";

//----------LISTENERS----------//

// Setting up DOM listeners
$("#create-button").click(createGame);
$("#join-button").click(joinGame);

// Setting up event listeners
socket.on('connect', () => { previousScreen = titleScreen; })
socket.on("game-created", gameCreated);
socket.on('player-one-joined', playerOneJoined);
socket.on('player-two-joined', playerTwoJoined);

//-----------DOM LISTENER FUNCTIONS-----------//

// When start button is clicked
function createGame() {
    const playerName = $("#player-name").val();

    if (playerName == "") {
        alert("Please enter a name.");
        return;
    }

    socket.emit("create-game", { playerName: playerName });
}

// When join button is clicked
function joinGame() {
    const playerName = $("#player-name").val();
    const roomID = $("#room-id").val();

    if (playerName == "") {
        alert("Please enter a name.");
        return;
    }

    if (roomID == "") {
        alert("Please enter a room ID.");
        return;
    }

    // TODO: Validate room ID

    socket.emit("join-game", { playerName: playerName, roomID: roomID });
}

//-----------EVENT LISTENER FUNCTIONS-----------//

// Hiding irrelevant elements once game is created
function gameCreated(data) {
    previousScreen.css("display", "none");
    waitingScreen.css("display", "flex");
    previousScreen = waitingScreen;

    $("#room-id-display").html(`Room ID: ${data.roomID}`);
}

// Hiding irrelevant elements once player 1 joins
function playerOneJoined(data) {
    previousScreen.css("display", "none");
    gameScreen.css("display", "flex");
    previousScreen = gameScreen;

    $("#player-one-name").html(data.playerName);
    $("#player-two-name").html("You");
    $("#gameroom-id").html(`Room ID: ${data.roomID}`);
}

// Hiding irrelevant elements once player 2 joins
function playerTwoJoined(data) {
    previousScreen.css("display", "none");
    gameScreen.css("display", "flex");
    previousScreen = gameScreen;

    $("#player-one-name").html("You");
    $("#player-two-name").html(data.playerName);
    $("#gameroom-id").html(`Room ID: ${data.roomID}`);
}