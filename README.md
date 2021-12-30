# Tic-Tac-Toe

A web app, built with the help of Node.js, Express and Socket.IO, that lets you play tic-tac-toe in real-time with other users.

# Rules

- The game is played on a 3x3 grid.
- Players take turns placing their marks in empty squares ("X" and "O").
- The first player to get three of their marks in a row (up, down, across, or diagonally) is the winner.
- When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie.

# Setup

1. Clone the repository.

2. Ensure that you have Node.js installed. If not, go [here](https://nodejs.org/en/). You may also refer to the [NPM documentation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

3. Within the repository, run the following command:
```bash
npm install
```
This will install all the required dependencies for the application.

4. Run the following command to start the application on port 3000:
```bash
npm start
```
or
```bash
npm run start
```

<b>Note: </b>If you wish to run the application using `nodemon`, you can run the following command:
```bash
npm run dev
```

5. Enter the following URL in your browser:
```bash
http://localhost:3000
```

6. You should be able to see the application in action. You may open up another tab in your browser to test the application.

7. Voilà! The application is now running!

# How to Play Against Other Users

1. When you visit the application URL, you will be greeted with two options: <b>CREATE GAME</b> and <b>JOIN GAME</b>.

2. If you choose <b>CREATE GAME</b>, you will have to enter a username and a unique room will be created for you. You will be placed in a temporary waiting state until another player joins your room.

3. If you choose <b>JOIN GAME</b>, you will have to enter a username and the room ID of the room you wish to join.

<b>Note 1: </b> If the room is full, you cannot join. If the room does not exist, you will be notified.

<b>Note 2: </b>If a user leaves the game and rejoins (or another user joins), the game will be reset.
