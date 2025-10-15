"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useGame } from "@/hooks/useGame";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";

// Move options for the game
const MOVE_OPTIONS = [
  { value: "1", label: "Rock" },
  { value: "2", label: "Paper" },
  { value: "3", label: "Scissors" },
  { value: "4", label: "Spock" },
  { value: "5", label: "Lizard" },
];

export default function HomePage() {
  const {
    account,
    networkName,
    isConnected,
    connectWallet,
    switchToSepolia,
    networkId,
    isCorrectNetwork,
  } = useWeb3();
  const {
    isLoading,
    error,
    success,
    createGame,
    loadGameInfo,
    joinGame,
    revealMove,
    j1Timeout,
    j2Timeout,
    checkGameState,
    clearMessages,
  } = useGame();

  // Form states
  const [createGameForm, setCreateGameForm] = useState({
    move: "",
    opponentAddress: "",
    stakeAmount: "",
  });

  const [joinGameForm, setJoinGameForm] = useState({
    contractAddress: "",
    move: "",
  });

  const [revealForm, setRevealForm] = useState({
    contractAddress: "",
    move: "",
    salt: "",
  });

  const [timeoutForm, setTimeoutForm] = useState({
    j1ContractAddress: "",
    j2ContractAddress: "",
  });

  const [checkStateForm, setCheckStateForm] = useState({
    contractAddress: "",
  });

  // Game state
  const [gameCreated, setGameCreated] = useState<{
    contractAddress: string;
    salt: string;
  } | null>(null);
  const [gameInfo, setGameInfo] = useState<{
    stake: string;
    player1: string;
    player2: string;
  } | null>(null);
  const [gameState, setGameState] = useState<any>(null);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      clearMessages();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      const result = await createGame(
        parseInt(createGameForm.move),
        createGameForm.opponentAddress,
        createGameForm.stakeAmount,
        account
      );

      if (result) {
        setGameCreated(result);
      }
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  const handleLoadGameInfo = async () => {
    if (!account || !joinGameForm.contractAddress) return;

    try {
      const info = await loadGameInfo(joinGameForm.contractAddress, account);
      setGameInfo(info);
    } catch (error) {
      console.error("Failed to load game info:", error);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      await joinGame(
        joinGameForm.contractAddress,
        parseInt(joinGameForm.move),
        account
      );
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  const handleRevealMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      await revealMove(
        revealForm.contractAddress,
        parseInt(revealForm.move),
        revealForm.salt,
        account
      );
    } catch (error) {
      console.error("Failed to reveal move:", error);
    }
  };

  const handleJ1Timeout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      await j1Timeout(timeoutForm.j1ContractAddress, account);
    } catch (error) {
      console.error("Failed to claim J1 timeout:", error);
    }
  };

  const handleJ2Timeout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      await j2Timeout(timeoutForm.j2ContractAddress, account);
    } catch (error) {
      console.error("Failed to claim J2 timeout:", error);
    }
  };

  const handleCheckGameState = async () => {
    if (!checkStateForm.contractAddress) return;

    try {
      const state = await checkGameState(checkStateForm.contractAddress);
      setGameState(state);
    } catch (error) {
      console.error("Failed to check game state:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              🎮 Blockchain Gaming
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Rock Paper Scissors
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Lizard Spock
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The ultimate blockchain version of the classic game. Play with
              friends, stake ETH, and experience secure, decentralized gaming.
            </p>

            {/* Connection Status */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {isConnected ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">
                    Connected to {networkName}
                  </span>
                  <span className="text-green-600 text-sm">
                    {account
                      ? `${account.slice(0, 6)}...${account.slice(-4)}`
                      : ""}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleConnectWallet}
                    disabled={isLoading}
                    className="px-8 py-3"
                  >
                    Connect MetaMask
                  </Button>
                  {networkId && !isCorrectNetwork(networkId) && (
                    <Button
                      onClick={switchToSepolia}
                      variant="secondary"
                      disabled={isLoading}
                      className="px-8 py-3"
                    >
                      Switch to Sepolia
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Rules - Quick Reference */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Game Rules
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🪨</span>
                  <span className="text-gray-700">
                    Rock crushes Scissors & Lizard
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <span className="text-gray-700">
                    Paper covers Rock & disproves Spock
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✂️</span>
                  <span className="text-gray-700">
                    Scissors cuts Paper & decapitates Lizard
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🦎</span>
                  <span className="text-gray-700">
                    Lizard eats Paper & poisons Spock
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🖖</span>
                  <span className="text-gray-700">
                    Spock vaporizes Rock & smashes Scissors
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                How to Play
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-gray-700">
                    Player 1 creates a game with a hidden move
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-gray-700">
                    Player 2 joins and plays their move
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-gray-700">
                    Player 1 reveals their move to determine winner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Network Warning */}
        {account && networkId && !isCorrectNetwork(networkId) && (
          <div className="mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-semibold text-amber-800">
                  Wrong Network
                </h3>
              </div>
              <p className="text-amber-700 mb-4">
                Please switch to Sepolia testnet to use this dApp.
              </p>
              <Button
                onClick={switchToSepolia}
                variant="secondary"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Switch to Sepolia
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        {(error || success) && (
          <div className="mb-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">
                Processing transaction...
              </p>
            </div>
          </div>
        )}

        {/* Game Actions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Create Game Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                Create New Game
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Start a new game as Player 1
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateGame} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Your Move
                  </label>
                  <Select
                    options={MOVE_OPTIONS}
                    value={createGameForm.move}
                    onChange={(e) =>
                      setCreateGameForm((prev) => ({
                        ...prev,
                        move: e.target.value,
                      }))
                    }
                    placeholder="Select your move"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opponent's Address
                  </label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={createGameForm.opponentAddress}
                    onChange={(e) =>
                      setCreateGameForm((prev) => ({
                        ...prev,
                        opponentAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stake Amount (ETH)
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.01"
                    value={createGameForm.stakeAmount}
                    onChange={(e) =>
                      setCreateGameForm((prev) => ({
                        ...prev,
                        stakeAmount: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 text-lg">💡</span>
                    <div>
                      <p className="font-medium text-blue-900 mb-1">
                        Important
                      </p>
                      <p className="text-blue-700 text-sm">
                        Your move will be encrypted with a random salt. Keep
                        this page open or save your salt - you'll need it to
                        reveal your move later!
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isConnected || isLoading}
                  className="w-full"
                >
                  Create Game
                </Button>
              </form>

              {gameCreated && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎉</span>
                    <h3 className="text-lg font-bold text-green-900">
                      Game Created!
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Contract Address:
                      </p>
                      <p className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                        {gameCreated.contractAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Your Salt:
                      </p>
                      <p className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded break-all">
                        {gameCreated.salt}
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="text-amber-800 text-sm font-medium">
                        ⚠️ SAVE THIS SALT! You'll need it to reveal your move.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => copyToClipboard(gameCreated.salt)}
                        className="flex-1"
                      >
                        Copy Salt
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(gameCreated.contractAddress)
                        }
                        className="flex-1"
                      >
                        Copy Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Join Game Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                Join Game
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Join an existing game as Player 2
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Contract Address
                  </label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={joinGameForm.contractAddress}
                    onChange={(e) =>
                      setJoinGameForm((prev) => ({
                        ...prev,
                        contractAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLoadGameInfo}
                  disabled={!isConnected || isLoading}
                  className="w-full"
                >
                  Load Game Info
                </Button>

                {gameInfo && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium text-green-800">
                            Stake Required:
                          </span>
                          <span className="text-green-700 ml-2">
                            {gameInfo.stake} ETH
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-green-800">
                            Player 1:
                          </span>
                          <span className="text-green-700 ml-2 font-mono">
                            {gameInfo.player1}
                          </span>
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleJoinGame} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Move
                        </label>
                        <Select
                          options={MOVE_OPTIONS}
                          value={joinGameForm.move}
                          onChange={(e) =>
                            setJoinGameForm((prev) => ({
                              ...prev,
                              move: e.target.value,
                            }))
                          }
                          placeholder="Select your move"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!isConnected || isLoading}
                        className="w-full"
                      >
                        Join Game & Play
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Reveal Move Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🔓</span>
                Reveal Move
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Reveal your move to complete the game
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleRevealMove} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Contract Address
                  </label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={revealForm.contractAddress}
                    onChange={(e) =>
                      setRevealForm((prev) => ({
                        ...prev,
                        contractAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Original Move
                  </label>
                  <Select
                    options={MOVE_OPTIONS}
                    value={revealForm.move}
                    onChange={(e) =>
                      setRevealForm((prev) => ({
                        ...prev,
                        move: e.target.value,
                      }))
                    }
                    placeholder="Select your move"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Salt
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your saved salt"
                    value={revealForm.salt}
                    onChange={(e) =>
                      setRevealForm((prev) => ({
                        ...prev,
                        salt: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!isConnected || isLoading}
                  className="w-full"
                >
                  Reveal & Resolve
                </Button>
              </form>
            </div>
          </div>

          {/* Game State Checker */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                Check Game State
              </h2>
              <p className="text-gray-100 text-sm mt-1">
                View current game information
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Contract Address
                  </label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={checkStateForm.contractAddress}
                    onChange={(e) =>
                      setCheckStateForm((prev) => ({
                        ...prev,
                        contractAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCheckGameState}
                  disabled={!isConnected || isLoading}
                  className="w-full"
                >
                  Check State
                </Button>

                {gameState && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-4">Game State</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Contract:</strong> {gameState.contractAddress}
                      </p>
                      <p>
                        <strong>Stake:</strong> {gameState.stake} ETH
                      </p>
                      <p>
                        <strong>Player 1:</strong> {gameState.player1}
                      </p>
                      <p>
                        <strong>Player 2:</strong> {gameState.player2}
                      </p>
                      <p>
                        <strong>Player 1 Commitment:</strong>{" "}
                        {gameState.commitment}
                      </p>
                      <p>
                        <strong>Player 2 Move:</strong> {gameState.player2Move}
                      </p>
                      <p>
                        <strong>Status:</strong> {gameState.status}
                      </p>
                      <p>
                        <strong>Last Action:</strong> {gameState.lastAction}
                      </p>
                      <p>
                        <strong>Timeout Period:</strong>{" "}
                        {gameState.timeoutPeriod}
                      </p>
                      <p>
                        <strong>Time Remaining:</strong>{" "}
                        {gameState.timeRemaining}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeout Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              Timeout Actions
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              Claim timeout if opponent doesn't respond
            </p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-orange-800">
                  Player 2 Didn't Play?
                </h3>
                <form onSubmit={handleJ1Timeout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Contract Address
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={timeoutForm.j1ContractAddress}
                      onChange={(e) =>
                        setTimeoutForm((prev) => ({
                          ...prev,
                          j1ContractAddress: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="warning"
                    disabled={!isConnected || isLoading}
                    className="w-full"
                  >
                    Claim Timeout (Player 1)
                  </Button>
                </form>
              </div>

              <div className="border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-orange-800">
                  Player 1 Didn't Reveal?
                </h3>
                <form onSubmit={handleJ2Timeout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Contract Address
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={timeoutForm.j2ContractAddress}
                      onChange={(e) =>
                        setTimeoutForm((prev) => ({
                          ...prev,
                          j2ContractAddress: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="warning"
                    disabled={!isConnected || isLoading}
                    className="w-full"
                  >
                    Claim Timeout (Player 2)
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="mb-2 text-gray-600">Network: Sepolia Testnet</p>
          <p className="text-sm text-gray-500">
            ⚠️ Security: Never share your salt before revealing. Always verify
            contract addresses.
          </p>
        </div>
      </footer>
    </div>
  );
}
