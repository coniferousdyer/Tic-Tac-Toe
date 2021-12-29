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
const gameOverScreen = $("#game-over-screen");

// Important global variables
let previousScreen = "";

//----------LISTENERS----------//

// Setting up DOM listeners
$("#create-button").click(createGame);
$("#join-button").click(joinGame);
$(".game-board-cell").click(playTurn);
$("#restart-button").click(restartGame);
$("#main-menu-button").click(backToMainMenu);

// Setting up event listeners
socket.on('connect', () => { previousScreen = titleScreen; })
socket.on("game-created", gameCreated);
socket.on("room-unavailable", message => { alert(message); });
socket.on('player-one-joined', playerOneJoined);
socket.on('player-two-joined', playerTwoJoined);
socket.on('turn-played', turnPlayed);
socket.on("game-over", gameOver);

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

    socket.emit("join-game", { playerName: playerName, roomID: roomID });
}

// When a cell is clicked
function playTurn(event) {
    // Checking if cell is already marked
    if ($(event.target).html() != "") {
        alert("Cell is already marked.");
        return;
    }

    const cellID = event.target.id.split("-")[1];
    const roomID = $("#gameroom-id").html().split(" ")[2];

    socket.emit("play-turn", { socketID: socket.id, roomID: roomID, cellID: cellID });
}

function restartGame() {
    socket.emit("restart-game", { socketID: socket.id });
}

function backToMainMenu() {
    socket.emit("back-to-main-menu", { socketID: socket.id });
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
    $("#player-one-name").css({ "background-color": "green", "color": "white" });
    $("#player-two-name").html("You");
    $("#gameroom-id").html(`Room ID: ${data.roomID}`);
}

// Hiding irrelevant elements once player 2 joins
function playerTwoJoined(data) {
    previousScreen.css("display", "none");
    gameScreen.css("display", "flex");
    previousScreen = gameScreen;

    $("#player-one-name").html("You");
    $("#player-one-name").css({ "background-color": "green", "color": "white" });
    $("#player-two-name").html(data.playerName);
    $("#gameroom-id").html(`Room ID: ${data.roomID}`);
}

// Updating the game board with the latest turn
function turnPlayed(data) {
    $(`#box-${data.cellID}`).html(data.symbol);

    if (data.turn == 1) {
        $("#player-one-name").css({ "background-color": "green", "color": "white" });
        $("#player-two-name").css({ "background-color": "transparent", "color": "black" });
    }
    else {
        $("#player-one-name").css({ "background-color": "transparent", "color": "black" });
        $("#player-two-name").css({ "background-color": "green", "color": "white" });
    }
}

// Displaying the winner
function gameOver(data) {
    previousScreen.css("display", "none");
    gameOverScreen.css("display", "flex");
    previousScreen = gameOverScreen;

    if (data.winner == "Draw") {
        $("#game-over-heading").html("It's a draw!");
        $("#game-over-message").html("Don't worry, you can always play again!");
    }
    else if (socket.id == data.socketID) {
        $("#game-over-heading").html("You win!");
        $("#game-over-heading").css("color", "green");
        $("#game-over-message").html("Well done, champ!");
    }
    else {
        $("#game-over-heading").html(`${data.winner} wins!`);
        $("#game-over-heading").css("color", "red");
        $("#game-over-message").html("Better luck next time!");
    }
}