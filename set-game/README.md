# Set Card Game

An interactive web-based implementation of the classic Set card game.

## What is Set?

Set is a card game where players identify "sets" of three cards. Each card has four attributes:
- **Number**: 1, 2, or 3 shapes
- **Shape**: Diamond, Oval, or Squiggle
- **Color**: Red, Green, or Purple
- **Shading**: Solid, Striped, or Empty

A valid **SET** consists of three cards where each attribute is either:
- All the **same** across the three cards, OR
- All **different** across the three cards

## How to Play

1. Open `index.html` in your web browser
2. The game displays 12 cards on the board
3. Click on 3 cards to select them
4. If they form a valid set, you'll score a point and those cards will be replaced
5. If not a valid set, you'll be notified and can try again

## Features

- **Interactive UI**: Click cards to select/deselect them
- **Score Tracking**: Keeps track of how many sets you've found
- **Hint System**: Stuck? Click "Show Hint" to see one available set
- **Add Cards**: If no sets are visible, add 3 more cards to the board
- **New Game**: Start fresh anytime with a new shuffled deck
- **Responsive Design**: Works on desktop and mobile devices

## Running the Game

Simply open `index.html` in any modern web browser:

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Or just open the file directly
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

Then navigate to `http://localhost:8000` (if using server) or the file will open directly in your browser.

## Game Controls

- **New Game**: Start a new game with a fresh deck
- **Show Hint**: Highlights one valid set if available
- **Add 3 Cards**: Adds 3 more cards to the board (when stuck or no sets available)

## Example of a Valid Set

Cards with:
- 1 Red Solid Diamond, 2 Red Solid Diamonds, 3 Red Solid Diamonds
  (All same color, all same shape, all same shading, all different numbers) ✓

- 1 Red Solid Diamond, 1 Green Striped Oval, 1 Purple Empty Squiggle
  (All different in every attribute) ✓

## Example of an Invalid Set

- 1 Red Solid Diamond, 2 Red Solid Diamonds, 2 Green Solid Diamonds
  (Number: two 2s and one 1 - not all same, not all different) ✗

## Technologies Used

- Pure HTML/CSS/JavaScript
- No external dependencies
- No build process required

Enjoy playing Set!
