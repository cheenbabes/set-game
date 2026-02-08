class GameManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map(); // playerId -> roomId mapping

    // Clean up stale rooms every 5 minutes
    this.ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
    setInterval(() => this.cleanupStaleRooms(), 5 * 60 * 1000);
  }

  cleanupStaleRooms() {
    const now = Date.now();
    for (const [roomId, room] of this.rooms) {
      if (now - room.lastActivity > this.ROOM_TTL_MS) {
        // Remove player mappings for this room
        for (const player of room.players) {
          this.playerRooms.delete(player.id);
        }
        this.rooms.delete(roomId);
        console.log(`Cleaned up stale room ${roomId}`);
      }
    }
  }

  createRoom() {
    const roomId = this.generateRoomId();
    this.rooms.set(roomId, {
      id: roomId,
      players: [],
      deck: [],
      board: [],
      gameStarted: false,
      gameOver: false,
      selections: new Map(), // playerId -> [cardIndices]
      lastActivity: Date.now()
    });
    return roomId;
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomCount() {
    return this.rooms.size;
  }

  addPlayerToRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      color: this.getPlayerColor(room.players.length)
    };

    room.players.push(player);
    this.playerRooms.set(playerId, roomId);

    return player;
  }

  getPlayerColor(index) {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];
    return colors[index % colors.length];
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.deck = this.createDeck();
    room.board = [];
    room.gameStarted = true;
    room.gameOver = false;
    room.selections.clear();
    room.lastActivity = Date.now();

    // Reset player scores
    room.players.forEach(player => player.score = 0);

    // Deal initial 12 cards
    this.dealCards(room, 12);
  }

  createDeck() {
    const numbers = [1, 2, 3];
    const shapes = ['diamond', 'oval', 'squiggle'];
    const colors = ['red', 'green', 'purple'];
    const shadings = ['solid', 'striped', 'empty'];

    const deck = [];
    for (let number of numbers) {
      for (let shape of shapes) {
        for (let color of colors) {
          for (let shading of shadings) {
            deck.push({ number, shape, color, shading });
          }
        }
      }
    }

    return this.shuffleArray(deck);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  dealCards(room, count) {
    for (let i = 0; i < count && room.deck.length > 0; i++) {
      room.board.push(room.deck.pop());
    }
  }

  selectCard(roomId, playerId, cardIndex) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameStarted) {
      return { success: false, message: 'Game not started' };
    }

    room.lastActivity = Date.now();

    if (cardIndex < 0 || cardIndex >= room.board.length) {
      return { success: false, message: 'Invalid card index' };
    }

    let selectedCards = room.selections.get(playerId) || [];

    // Toggle selection
    const existingIndex = selectedCards.indexOf(cardIndex);
    if (existingIndex > -1) {
      selectedCards.splice(existingIndex, 1);
    } else {
      if (selectedCards.length < 3) {
        selectedCards.push(cardIndex);
      } else {
        return { success: false, message: 'Already selected 3 cards' };
      }
    }

    room.selections.set(playerId, selectedCards);

    return { success: true, selectedCards };
  }

  checkSet(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return { isValid: false };

    const selectedIndices = room.selections.get(playerId) || [];
    if (selectedIndices.length !== 3) {
      return { isValid: false };
    }

    const cards = selectedIndices.map(i => room.board[i]);
    const player = room.players.find(p => p.id === playerId);

    const isValid = this.isValidSet(cards);

    if (isValid) {
      // Award point
      player.score++;

      // Remove cards from board (in reverse order to maintain indices)
      selectedIndices.sort((a, b) => b - a);
      for (let index of selectedIndices) {
        room.board.splice(index, 1);
      }

      // Add new cards if needed
      const cardsToAdd = Math.min(3, 12 - room.board.length, room.deck.length);
      this.dealCards(room, cardsToAdd);

      // Check if game is over
      if (room.deck.length === 0 && this.findSets(room.board).length === 0) {
        room.gameOver = true;
      }
    }

    // Clear all selections
    room.selections.clear();

    return {
      isValid,
      playerName: player.name,
      cards,
      score: player.score
    };
  }

  isValidSet(cards) {
    if (cards.length !== 3) return false;

    const attributes = ['number', 'shape', 'color', 'shading'];

    for (let attr of attributes) {
      const values = cards.map(card => card[attr]);
      const allSame = values.every(v => v === values[0]);
      const allDifferent = new Set(values).size === 3;

      if (!allSame && !allDifferent) {
        return false;
      }
    }

    return true;
  }

  findSets(board) {
    const sets = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = i + 1; j < board.length; j++) {
        for (let k = j + 1; k < board.length; k++) {
          const cards = [board[i], board[j], board[k]];
          if (this.isValidSet(cards)) {
            sets.push([i, j, k]);
          }
        }
      }
    }
    return sets;
  }

  getHint(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const sets = this.findSets(room.board);
    return sets.length > 0 ? sets[0] : null;
  }

  add3Cards(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.deck.length < 3) {
      return { success: false, message: 'Not enough cards in deck' };
    }

    this.dealCards(room, 3);
    return { success: true };
  }

  getGameState(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Determine winner if game is over
    let winner = null;
    if (room.gameOver && room.players.length > 0) {
      winner = room.players.reduce((max, player) =>
        player.score > max.score ? player : max
      );
    }

    return {
      roomId: room.id,
      players: room.players,
      board: room.board,
      deckSize: room.deck.length,
      gameStarted: room.gameStarted,
      gameOver: room.gameOver,
      winner,
      selections: Object.fromEntries(room.selections)
    };
  }

  removePlayer(playerId) {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (room) {
      room.players = room.players.filter(p => p.id !== playerId);
      room.selections.delete(playerId);

      // Remove empty rooms
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
    }

    this.playerRooms.delete(playerId);
    return roomId;
  }
}

module.exports = GameManager;
