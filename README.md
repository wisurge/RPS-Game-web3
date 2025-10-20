# RPSLS Game - Next.js dApp

A fully functional Rock Paper Scissors Lizard Spock game on Ethereum blockchain with secure commitment schemes and timeout protection.

## 🚀 Quick Start

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

3. Open http://localhost:3000

**✅ Ready to use!** The smart contract is already compiled and integrated.

## 🎮 How to Play

1. **Connect MetaMask** to Sepolia testnet (automatic network switching included)
2. **Player 1**: Create game → select move → enter opponent address → set stake → **SAVE YOUR SALT!**
3. **Player 2**: Enter contract address → load game → select move → join game
4. **Player 1**: Enter contract address → enter original move → enter saved salt → reveal

## 🎯 Game Rules

- **Rock** crushes Scissors and Lizard
- **Paper** covers Rock and disproves Spock
- **Scissors** cuts Paper and decapitates Lizard
- **Lizard** eats Paper and poisons Spock
- **Spock** vaporizes Rock and smashes Scissors

## ✨ Features

- ✅ **Secure Commitment Scheme**: Player 1's move is hidden until reveal
- ✅ **Automatic Network Detection**: Switches to Sepolia testnet automatically
- ✅ **Timeout Protection**: 5-minute timeouts prevent fund locking
- ✅ **Input Validation**: All inputs validated before transactions
- ✅ **Error Handling**: Clear error messages and user guidance
- ✅ **Salt Management**: Secure random salt generation with localStorage backup

## 📋 Requirements

- MetaMask wallet
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- Modern web browser

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: ethers.js v6, MetaMask integration
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contract**: Solidity 0.8.0+ (pre-compiled)

## 🎓 Nash Equilibrium

**Optimal Strategy**: Each player should play each move with equal probability (20% each: Rock 20%, Paper 20%, Scissors 20%, Spock 20%, Lizard 20%).

This ensures no move provides an advantage, resulting in an expected payoff of 0 for both players.

**Full Explanation**: See `NASH_EQUILIBRIUM_EXPLANATION.md` for mathematical proof.

---
