# Set Card Game - Multiplayer Edition

A real-time multiplayer implementation of the classic Set card game, built with Node.js, Express, and Socket.IO.

## 🎮 Features

- **Real-time Multiplayer**: Play with up to 6 players simultaneously
- **Room System**: Create private game rooms with shareable room codes
- **Live Game State**: See other players' card selections in real-time
- **Score Tracking**: Compete to find the most sets
- **Hint System**: Stuck? Get hints to find valid sets
- **Responsive Design**: Works on desktop and mobile devices
- **No Login Required**: Just enter your name and start playing

## 🎯 How to Play

### The Game
Set is a card game where players identify "sets" of three cards. Each card has four attributes:
- **Number**: 1, 2, or 3 shapes
- **Shape**: Diamond, Oval, or Squiggle
- **Color**: Red, Green, or Purple
- **Shading**: Solid, Striped, or Empty

A valid **SET** consists of three cards where each attribute is either:
- All the **same** across the three cards, OR
- All **different** across the three cards

### Multiplayer Rules
1. All players see the same board
2. Race to find sets before other players
3. Click 3 cards to submit a set
4. First to find it gets the point
5. Most sets wins!

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd set-game-multiplayer

# Install dependencies
npm install

# Start the server
npm start
```

The game will be available at `http://localhost:3000`

### Development Mode

```bash
# Run with auto-reload
npm run dev
```

## 🚂 Deploying to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Node.js app and deploy it

3. **Access your game**
   - Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)
   - Share this URL with friends to play together!

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Environment Variables

The app automatically uses `process.env.PORT` which Railway provides. No additional configuration needed!

## 📁 Project Structure

```
set-game-multiplayer/
├── server/
│   ├── index.js          # Express server & Socket.IO setup
│   └── gameManager.js    # Game logic and room management
├── public/
│   └── index.html        # Frontend (HTML/CSS/JS)
├── package.json          # Dependencies and scripts
├── Procfile             # Railway deployment config
└── README.md            # This file
```

## 🎮 Game Controls

### Lobby
- **Create New Game**: Start a new game room and get a room code
- **Join Game**: Enter a room code to join an existing game

### In-Game
- **Click Cards**: Select up to 3 cards to form a set
- **💡 Hint**: Get a hint showing one valid set
- **➕ Add 3 Cards**: Add more cards if no sets are visible
- **🚪 Leave Game**: Exit to lobby

## 🔧 Technical Details

### Backend (Node.js)
- **Express**: Web server framework
- **Socket.IO**: Real-time bidirectional communication
- **GameManager**: Custom class managing game rooms and logic

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Socket.IO Client**: Real-time server communication
- **CSS Grid**: Responsive card layout

### Key Features
- Room-based multiplayer architecture
- Server-authoritative game state
- Real-time event broadcasting
- Player color coding for selections
- Automatic game over detection

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Issues
- Ensure firewall allows WebSocket connections
- Check that PORT environment variable is set correctly
- Verify Socket.IO versions match between client and server

## 🎨 Customization

### Change Player Limit
Edit `server/index.js`:
```javascript
if (room.players.length >= 6) {  // Change 6 to your desired limit
```

### Modify Initial Cards
Edit `server/gameManager.js`:
```javascript
this.dealCards(room, 12);  // Change 12 to desired number
```

### Adjust Colors
Edit `public/index.html` CSS section or `server/gameManager.js` `getPlayerColor()` method.

## 📊 API Events (Socket.IO)

### Client → Server
- `createRoom(playerName)` - Create a new game room
- `joinRoom({ roomId, playerName })` - Join existing room
- `startGame(roomId)` - Start the game
- `selectCard({ roomId, cardIndex })` - Select a card
- `requestHint(roomId)` - Get a hint
- `add3Cards(roomId)` - Add 3 cards to board

### Server → Client
- `roomCreated({ roomId, player })` - Room created successfully
- `roomJoined({ roomId, player })` - Joined room successfully
- `gameState(state)` - Current game state
- `gameStarted(state)` - Game has started
- `cardSelected({ playerId, cardIndex, selectedCards })` - Card selected
- `validSet({ playerId, playerName, score })` - Valid set found
- `invalidSet({ playerId, playerName })` - Invalid set attempt
- `playerJoined({ player })` - New player joined
- `playerLeft({ playerId })` - Player disconnected
- `gameOver({ winner, players })` - Game ended
- `error({ message })` - Error occurred

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and pull requests.

## 🎉 Credits

Built with ❤️ using Node.js, Express, and Socket.IO

---

**Enjoy playing Set with friends! 🎴**
