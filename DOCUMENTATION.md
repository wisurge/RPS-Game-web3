# RPSLS dApp - Complete Documentation

## 🎮 What is RPSLS?

Rock Paper Scissors Lizard Spock is an extension of the classic game with 5 moves instead of 3:

- **Rock** crushes Scissors and Lizard
- **Paper** covers Rock and disproves Spock
- **Scissors** cuts Paper and decapitates Lizard
- **Lizard** eats Paper and poisons Spock
- **Spock** vaporizes Rock and smashes Scissors

Each move beats exactly 2 others and loses to 2 others, creating a balanced game.

## 🚀 Quick Start (5 Minutes)

### 1. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 2. Smart Contract

**✅ READY TO USE**: The smart contract is already compiled and integrated!

The `RPS.sol` contract has been compiled and the ABI/bytecode are already configured in `hooks/useGame.ts`. No additional setup required.

### 3. Connect Wallet

1. Install [MetaMask](https://metamask.io/)
2. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Click "Connect MetaMask" in the app
4. **Automatic Network Switching**: The app will automatically prompt you to switch to Sepolia testnet if needed

### 4. Play Your First Game

1. **Player 1**: Create game → select move → enter opponent address → set stake → **SAVE YOUR SALT!**
2. **Player 2**: Enter contract address → load game → select move → join game
3. **Player 1**: Enter contract address → enter original move → enter saved salt → reveal

## 🎯 How to Play

### Game Flow

1. **Player 1** creates a game with a hidden commitment (move + random salt)
2. **Player 2** joins the game by playing their move openly
3. **Player 1** reveals their move using the original salt
4. Smart contract determines winner and distributes stakes

### Security Features

- **Commitment Scheme**: Player 1's move is hidden until reveal
- **Cryptographic Salt**: 256-bit random salt prevents cheating
- **Timeout Protection**: 5-minute timeouts prevent fund locking
- **Input Validation**: All inputs are validated before transactions
- **Network Validation**: Automatic detection and switching to correct network
- **Error Handling**: Comprehensive error messages and user guidance

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: ethers.js v6, MetaMask
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contract**: Solidity 0.8.0+

## 📁 Project Structure

```
├── app/
│   ├── page.tsx          # Main game interface
│   ├── layout.tsx        # App layout
│   └── globals.css       # Tailwind styles
├── components/
│   ├── atoms/            # Basic components (Button, Input, etc.)
│   └── molecules/        # Combined components (FormGroup, InfoBox)
├── hooks/
│   ├── useWeb3.ts        # Wallet connection logic
│   └── useGame.ts        # Game interaction logic
├── RPS.sol              # Smart contract (compile this!)
└── README.md            # Simple setup guide
```

## 🔧 Configuration

### Network Setup

- **Testnet**: Sepolia (Chain ID: 11155111)
- **Why Sepolia**: Most stable testnet with good faucet support

### Smart Contract

The `RPS.sol` contract includes:

- Commitment scheme implementation
- 5-minute timeout mechanism
- Winner determination logic
- Proper access controls

## 🚨 Important Security Notes

### For Players

- **SAVE YOUR SALT**: You cannot reveal your move without it
- **Verify Addresses**: Always double-check contract addresses
- **Testnet Only**: This is configured for testing, not mainnet
- **Gas Fees**: Ensure you have enough ETH for transactions

### For Developers

- **✅ Contract Ready**: Contract is already compiled and integrated
- **✅ ABI/Bytecode**: Already configured in `useGame.ts`
- **✅ Network**: Automatic network detection and switching implemented

## 🐛 Troubleshooting

### Common Issues

| Problem                       | Solution                                       |
| ----------------------------- | ---------------------------------------------- |
| "Please install MetaMask"     | Install MetaMask browser extension             |
| "Invalid contract address"    | Check address format (0x...)                   |
| "Insufficient funds"          | Get more ETH from faucet                       |
| "Wrong network"               | Click "Switch to Sepolia" button (automatic)   |
| "Invalid move or salt"        | Ensure you're using the original move and salt |
| "Player 2 has already played" | This game is already in progress               |

### Getting Help

1. Check browser console for errors
2. Verify MetaMask connection
3. Ensure sufficient ETH balance
4. Double-check contract addresses

## 🚀 Deployment

### Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Start production server
```

### Production Deployment

#### Vercel (Recommended)

```bash
npx vercel
```

#### Netlify

```bash
npm run build
# Upload .next folder to Netlify
```

#### GitHub Pages

```bash
npm run build
npm run export
# Upload out/ folder to GitHub Pages
```

## 🎓 Game Theory: Nash Equilibrium

**Question**: What is the optimal strategy for RPSLS?

**Answer**: Each player should play each move with equal probability (20% each: Rock 20%, Paper 20%, Scissors 20%, Spock 20%, Lizard 20%).

**Why**: In this symmetric zero-sum game, each move beats exactly 2 others and loses to 2 others. The uniform distribution ensures no move provides an advantage, resulting in an expected payoff of 0 for both players.

## 🔒 Security Analysis

### Protected Against

- ✅ **Front-Running**: Commitment scheme prevents move observation
- ✅ **Move Manipulation**: Hash verification ensures integrity
- ✅ **Salt Prediction**: Cryptographically secure random generation
- ✅ **Timeout Exploitation**: Fair timeout mechanisms for both players
- ✅ **Reentrancy**: Proper Solidity patterns used
- ✅ **Network Attacks**: Automatic network validation and switching
- ✅ **Input Validation**: All user inputs validated before blockchain interaction

### User Responsibilities

- ⚠️ **Salt Storage**: Users must save their salt securely (localStorage backup provided)
- ⚠️ **Address Verification**: Users must verify contract addresses
- ⚠️ **Network Selection**: Automatic network switching handles this

## 🆕 Recent Improvements (Latest Version)

### ✅ All Issues Fixed

- **Contract Integration**: Smart contract fully compiled and integrated
- **ABI Compatibility**: Correct ABI matching the actual contract
- **Hash Generation**: Fixed commitment hash to match contract's `abi.encodePacked`
- **Move Enum**: Proper mapping between frontend (1-5) and contract (0-5) values
- **Network Validation**: Automatic Sepolia testnet detection and switching
- **Error Handling**: Comprehensive error messages and user guidance
- **TypeScript**: All type errors resolved with proper declarations

### 🚀 New Features

- **Automatic Network Switching**: One-click switch to Sepolia testnet
- **Network Validation**: Clear warnings when on wrong network
- **Enhanced Error Messages**: Specific guidance for different scenarios
- **Improved Type Safety**: Proper TypeScript declarations throughout
- **Better UX**: Loading states, transaction feedback, and clear instructions

## 📚 Smart Contract Details

### Contract Functions

- `constructor(bytes32 _c1Hash, address _j2)`: Deploy new game
- `play(uint8 _c2)`: Player 2 makes their move
- `solve(uint8 _c1, uint256 _salt)`: Player 1 reveals their move
- `j1Timeout()`: Player 2 claims timeout if Player 1 doesn't reveal
- `j2Timeout()`: Player 1 claims timeout if Player 2 doesn't play

### Contract State

- `j1`: Player 1 address
- `j2`: Player 2 address
- `c1Hash`: Player 1's commitment hash
- `c2`: Player 2's move
- `stake`: Game stake amount
- `lastAction`: Timestamp of last action
- `TIMEOUT`: Timeout period (300 seconds)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Based on Kleros coding challenge
- Smart contract from [github.com/clesaege/RPS](https://github.com/clesaege/RPS)
- RPSLS game created by Sam Kass
- Built with Next.js, ethers.js, and Tailwind CSS

---

## 🎮 Ready to Play?

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Connect wallet**: MetaMask (automatic network switching)
4. **Play your first game**: Follow the 3-step process above

**✅ Everything is ready to go! Happy gaming! 🎲🔗**

---

_This dApp demonstrates secure blockchain game implementation with proper commitment schemes, timeout protection, and modern React architecture. Perfect for learning Web3 development!_
