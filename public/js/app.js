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

//----------DOM LISTENERS----------//

// When start button is clicked
$("#create-button").click(() => {
    const playerName = $("#player-name").val();

    if (playerName == "") {
        alert("Please enter a name.");
        return;
    }

    socket.emit("create-game", { playerName: playerName });
});

// When join button is clicked
$("#join-button").click(() => {
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
});

// When a cell is clicked
$(".game-board-cell").click(event => {
    // Checking if cell is already marked
    if ($(event.target).html() != "") {
        alert("Cell is already marked.");
        return;
    }

    const cellID = event.target.id.split("-")[1];
    const roomID = $("#gameroom-id").html().split(" ")[2];

    socket.emit("play-turn", { socketID: socket.id, roomID: roomID, cellID: cellID });
});

// When the "Return to Main Menu" button is clicked
$(".main-menu-button").click(() => {
    socket.emit("back-to-main-menu");
});

//----------EVENT LISTENERS----------//

// Setting up event listeners
socket.on('connect', () => {
    previousScreen = titleScreen;
});

// Hiding irrelevant elements once game is created
socket.on("game-created", data => {
    previousScreen.css("display", "none");
    waitingScreen.css("display", "flex");
    previousScreen = waitingScreen;

    $("#room-id-display").html(`Room ID: ${data.roomID}`);
});

socket.on("alert-user", message => {
    alert(message);
});

// Hiding irrelevant elements once player 1 joins
socket.on('player-one-joined', data => {
    previousScreen.css("display", "none");
    gameScreen.css("display", "flex");
    previousScreen = gameScreen;

    $("#player-one-name").html(data.playerName);
    $("#player-one-name").css({ "background-color": "green", "color": "white" });
    $("#player-two-name").html("You");
    $("#player-two-name").css({ "background-color": "transparent", "color": "black" });
    $("#gameroom-id").html(`Room ID: ${data.roomID}`);
    $(".game-board-cell").html("");

    alert(`You are playing against ${data.playerName}.`);
});

// Hiding irrelevant elements once player 2 joins
socket.on('player-two-joined', data => {
    previousScreen.css("display", "none");
    gameScreen.css("display", "flex");
    previousScreen = gameScreen;

    $("#player-one-name").html("You");
    $("#player-one-name").css({ "background-color": "green", "color": "white" });
    $("#player-two-name").html(data.playerName);
    $("#player-two-name").css({ "background-color": "transparent", "color": "black" });
    $("#gameroom-id").html(`Room ID: ${data.roomID}`);
    $(".game-board-cell").html("");

    alert(`${data.playerName} has joined the game.`);
});

// Updating the game board with the latest turn
socket.on('turn-played', data => {
    $(`#box-${data.cellID}`).html(data.symbol);

    if (data.turn == 1) {
        $("#player-one-name").css({ "background-color": "green", "color": "white" });
        $("#player-two-name").css({ "background-color": "transparent", "color": "black" });
    }
    else {
        $("#player-one-name").css({ "background-color": "transparent", "color": "black" });
        $("#player-two-name").css({ "background-color": "green", "color": "white" });
    }
});

// Displaying the winner
socket.on("game-over", data => {
    previousScreen.css("display", "none");
    gameOverScreen.css("display", "flex");
    previousScreen = gameOverScreen;

    if (data.winner == "Draw") {
        $("#game-over-heading").html("It's a draw!");
        $("#game-over-heading").css("color", "black");
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
});

// Returning to main menu
socket.on("return-to-main-menu", () => {
    previousScreen.css("display", "none");
    titleScreen.css("display", "flex");
    previousScreen = titleScreen;

    $("#player-one-name").css("background-color", "transparent");
    $("#player-two-name").css("background-color", "transparent");
    $(".game-board-cell").html("");
});