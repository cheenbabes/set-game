const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Game manager instance
const gameManager = new GameManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new game room
  socket.on('createRoom', (playerName) => {
    const roomId = gameManager.createRoom();
    const player = gameManager.addPlayerToRoom(roomId, socket.id, playerName);

    socket.join(roomId);
    socket.emit('roomCreated', { roomId, player });

    // Send initial game state
    const gameState = gameManager.getGameState(roomId);
    io.to(roomId).emit('gameState', gameState);

    console.log(`Room ${roomId} created by ${playerName}`);
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = gameManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 6) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const player = gameManager.addPlayerToRoom(roomId, socket.id, playerName);
    socket.join(roomId);

    socket.emit('roomJoined', { roomId, player });

    // Notify all players in room
    const gameState = gameManager.getGameState(roomId);
    io.to(roomId).emit('gameState', gameState);
    io.to(roomId).emit('playerJoined', { player });

    console.log(`${playerName} joined room ${roomId}`);
  });

  // Start the game
  socket.on('startGame', (roomId) => {
    const room = gameManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    gameManager.startGame(roomId);
    const gameState = gameManager.getGameState(roomId);
    io.to(roomId).emit('gameStarted', gameState);

    console.log(`Game started in room ${roomId}`);
  });

  // Select a card
  socket.on('selectCard', ({ roomId, cardIndex }) => {
    const result = gameManager.selectCard(roomId, socket.id, cardIndex);

    if (!result.success) {
      socket.emit('error', { message: result.message });
      return;
    }

    // Broadcast selection to all players
    io.to(roomId).emit('cardSelected', {
      playerId: socket.id,
      cardIndex,
      selectedCards: result.selectedCards
    });

    // If 3 cards selected, check for set
    if (result.selectedCards.length === 3) {
      const setResult = gameManager.checkSet(roomId, socket.id);

      if (setResult.isValid) {
        // Valid set found!
        io.to(roomId).emit('validSet', {
          playerId: socket.id,
          playerName: setResult.playerName,
          cards: setResult.cards,
          score: setResult.score
        });

        // Send updated game state
        setTimeout(() => {
          const gameState = gameManager.getGameState(roomId);
          io.to(roomId).emit('gameState', gameState);

          // Check if game is over
          if (gameState.gameOver) {
            io.to(roomId).emit('gameOver', {
              winner: gameState.winner,
              players: gameState.players
            });
          }
        }, 1500);
      } else {
        // Invalid set
        io.to(roomId).emit('invalidSet', {
          playerId: socket.id,
          playerName: setResult.playerName
        });

        // Clear selection after a moment
        setTimeout(() => {
          const gameState = gameManager.getGameState(roomId);
          io.to(roomId).emit('gameState', gameState);
        }, 1000);
      }
    }
  });

  // Add 3 more cards to the board
  socket.on('add3Cards', (roomId) => {
    const result = gameManager.add3Cards(roomId);

    if (!result.success) {
      socket.emit('error', { message: result.message });
      return;
    }

    const gameState = gameManager.getGameState(roomId);
    io.to(roomId).emit('gameState', gameState);
    io.to(roomId).emit('cardsAdded', { count: 3 });
  });

  // Request hint
  socket.on('requestHint', (roomId) => {
    const hint = gameManager.getHint(roomId);

    if (hint) {
      socket.emit('hint', { indices: hint });
    } else {
      socket.emit('error', { message: 'No sets available on the board' });
    }
  });

  // Player disconnect
  socket.on('disconnect', () => {
    const roomId = gameManager.removePlayer(socket.id);

    if (roomId) {
      const gameState = gameManager.getGameState(roomId);

      if (gameState) {
        io.to(roomId).emit('playerLeft', { playerId: socket.id });
        io.to(roomId).emit('gameState', gameState);
      }
    }

    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: gameManager.getRoomCount() });
});

server.listen(PORT, () => {
  console.log(`Set Game Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to play`);
});
