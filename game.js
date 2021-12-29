/*--------------------------------------------------*
 * This file contains the game logic.               *
 * It is responsible for:                           *
 *  - Evaluating win conditions                     *
 *  - Communicating results with server             *
 *--------------------------------------------------*/

// The Player class
class Player {
    constructor(socketID, name, symbol) {
        this.socketID = socketID;
        this.name = name;
        this.symbol = symbol;
    }
}

// The Game class
class Game {
    constructor(playerOne, playerTwo, roomID, turn) {
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.roomID = roomID;
        this.turn = turn;
        this.board = [[null, null, null], [null, null, null], [null, null, null]];
    }

    // Marks the cell with the given ID with the given symbol
    markBoard(symbol, cellID) {
        cellID--;
        let row = Math.floor(cellID / 3);
        let col = cellID % 3;
        this.board[row][col] = symbol;
    }

    // Checks if the given symbol has won the game
    checkWin(symbol, cellID) {
        cellID--;
        let row = Math.floor(cellID / 3);
        let col = cellID % 3;

        // Check row
        if (this.board[row][0] == symbol && this.board[row][1] == symbol && this.board[row][2] == symbol)
            return true;

        // Check column
        if (this.board[0][col] == symbol && this.board[1][col] == symbol && this.board[2][col] == symbol)
            return true;

        // Check diagonals
        if (this.board[0][0] == symbol && this.board[1][1] == symbol && this.board[2][2] == symbol)
            return true;
        if (this.board[0][2] == symbol && this.board[1][1] == symbol && this.board[2][0] == symbol)
            return true;

        return false;
    }

    // Checks if the game is a draw
    checkDraw() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] == null) {
                    return false;
                }
            }
        }

        return true;
    }

    // Restarts the game
    restart() {
        this.board = [[null, null, null], [null, null, null], [null, null, null]];
        this.turn = 1;
    }
}

module.exports = {
    Player: Player,
    Game: Game
};