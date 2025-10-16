'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// RPS Contract ABI - compiled from RPS.sol
// Move enum: Null=0, Rock=1, Paper=2, Scissors=3, Spock=4, Lizard=5
const RPS_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_c1Hash",
        "type": "bytes32"
      },
      {
        "internalType": "address payable",
        "name": "_j2",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "TIMEOUT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "c1Hash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "c2",
    "outputs": [
      {
        "internalType": "enum RPS.Move",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "_c",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_salt",
        "type": "uint256"
      }
    ],
    "name": "hash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "j1",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "j1Timeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "j2",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "j2Timeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastAction",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum RPS.Move",
        "name": "_c2",
        "type": "uint8"
      }
    ],
    "name": "play",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum RPS.Move",
        "name": "_c1",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_salt",
        "type": "uint256"
      }
    ],
    "name": "solve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stake",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// RPS Contract Bytecode - Compiled from RPS.sol
const RPS_BYTECODE = "0x6080604052604051610c6f380380610c6f83398101604081905261002291610122565b600034116100775760405162461bcd60e51b815260206004820152601660248201527f5374616b65206d75737420626520706f7369746976650000000000000000000060448201526064015b60405180910390fd5b6001600160a01b0381161580159061009857506001600160a01b0381163314155b6100e45760405162461bcd60e51b815260206004820152601860248201527f496e76616c696420706c61796572203220616464726573730000000000000000604482015260640161006e565b60008054336001600160a01b031991821617909155600180549091166001600160a01b0392909216919091179055600255346004554260055561015f565b6000806040838503121561013557600080fd5b825160208401519092506001600160a01b038116811461015457600080fd5b809150509250929050565b610b018061016e6000396000f3fe6080604052600436106100a75760003560e01c806380985af91161006457806380985af91461015c57806389f71d5314610194578063a5ddec7c146101aa578063c37597c6146101ca578063c8391142146101ea578063f56f48f2146101ff57600080fd5b8063294914a4146100ac5780633a4b66f1146100c357806348e257cb146100ec5780634d03e3d21461011357806353a04b051461012957806367ef4c131461013c575b600080fd5b3480156100b857600080fd5b506100c1610215565b005b3480156100cf57600080fd5b506100d960045481565b6040519081526020015b60405180910390f35b3480156100f857600080fd5b506003546101069060ff1681565b6040516100e391906109b7565b34801561011f57600080fd5b506100d960025481565b6100c16101373660046109f3565b610343565b34801561014857600080fd5b506100d9610157366004610a15565b6104b8565b34801561016857600080fd5b5060015461017c906001600160a01b031681565b6040516001600160a01b0390911681526020016100e3565b3480156101a057600080fd5b506100d960055481565b3480156101b657600080fd5b506100c16101c5366004610a47565b6104fb565b3480156101d657600080fd5b5060005461017c906001600160a01b031681565b3480156101f657600080fd5b506100c1610704565b34801561020b57600080fd5b506100d961012c81565b6000546001600160a01b03163381146102495760405162461bcd60e51b815260040161024090610a63565b60405180910390fd5b600060035460ff166005811115610262576102626109a1565b146102af5760405162461bcd60e51b815260206004820152601b60248201527f506c6179657220322068617320616c726561647920706c6179656400000000006044820152606401610240565b61012c6005546102bf9190610aa1565b4210156103045760405162461bcd60e51b8152602060048201526013602482015272151a5b595bdd5d081b9bdd081c995858da1959606a1b6044820152606401610240565b600080546004546040516001600160a01b039092169281156108fc029290818181858888f1935050505015801561033f573d6000803e3d6000fd5b5050565b6001546001600160a01b031633811461036e5760405162461bcd60e51b815260040161024090610a63565b600060035460ff166005811115610387576103876109a1565b146103d45760405162461bcd60e51b815260206004820152601760248201527f506c61796572203220616c726561647920706c617965640000000000000000006044820152606401610240565b60008260058111156103e8576103e86109a1565b11801561040757506005826005811115610404576104046109a1565b11155b6104425760405162461bcd60e51b815260206004820152600c60248201526b496e76616c6964206d6f766560a01b6044820152606401610240565b600454341461048c5760405162461bcd60e51b8152602060048201526016602482015275125b98dbdc9c9958dd081cdd185ad948185b5bdd5b9d60521b6044820152606401610240565b6003805483919060ff191660018360058111156104ab576104ab6109a1565b0217905550504260055550565b6040516001600160f81b031960f884901b166020820152602181018290526000906041016040516020818303038152906040528051906020012090505b92915050565b6000546001600160a01b03163381146105265760405162461bcd60e51b815260040161024090610a63565b600060035460ff16600581111561053f5761053f6109a1565b0361058c5760405162461bcd60e51b815260206004820152601b60248201527f506c61796572203220686173206e6f7420706c617965642079657400000000006044820152606401610240565b6002546105aa8460058111156105a4576105a46109a1565b846104b8565b146105ee5760405162461bcd60e51b8152602060048201526014602482015273125b9d985b1a59081b5bdd99481bdc881cd85b1d60621b6044820152606401610240565b60035460009061060290859060ff16610833565b90508060010361065b576000546004546001600160a01b03909116906108fc9061062d906002610ab4565b6040518115909202916000818181858888f19350505050158015610655573d6000803e3d6000fd5b506106fe565b80600203610684576001546004546001600160a01b03909116906108fc9061062d906002610ab4565b600080546004546040516001600160a01b039092169281156108fc029290818181858888f193505050501580156106bf573d6000803e3d6000fd5b506001546004546040516001600160a01b039092169181156108fc0291906000818181858888f193505050501580156106fc573d6000803e3d6000fd5b505b50505050565b6001546001600160a01b031633811461072f5760405162461bcd60e51b815260040161024090610a63565b600060035460ff166005811115610748576107486109a1565b036107955760405162461bcd60e51b815260206004820152601b60248201527f506c61796572203220686173206e6f7420706c617965642079657400000000006044820152606401610240565b61012c6005546107a59190610aa1565b4210156107ea5760405162461bcd60e51b8152602060048201526013602482015272151a5b595bdd5d081b9bdd081c995858da1959606a1b6044820152606401610240565b6001546004546001600160a01b03909116906108fc9061080b906002610ab4565b6040518115909202916000818181858888f1935050505015801561033f573d6000803e3d6000fd5b6000816005811115610847576108476109a1565b836005811115610859576108596109a1565b03610866575060006104f5565b600183600581111561087a5761087a6109a1565b036108c75760035b826005811115610894576108946109a1565b14806108b2575060055b8260058111156108b0576108b06109a1565b145b156108bf575060016104f5565b5060026104f5565b60028360058111156108db576108db6109a1565b036109025760018260058111156108f4576108f46109a1565b14806108b25750600461089e565b6003836005811115610916576109166109a1565b03610922576002610882565b6004836005811115610936576109366109a1565b0361095d57600382600581111561094f5761094f6109a1565b14806108b25750600161089e565b6005836005811115610971576109716109a1565b0361099857600482600581111561098a5761098a6109a1565b14806108b25750600261089e565b50600092915050565b634e487b7160e01b600052602160045260246000fd5b60208101600683106109d957634e487b7160e01b600052602160045260246000fd5b91905290565b8035600681106109ee57600080fd5b919050565b600060208284031215610a0557600080fd5b610a0e826109df565b9392505050565b60008060408385031215610a2857600080fd5b823560ff81168114610a3957600080fd5b946020939093013593505050565b60008060408385031215610a5a57600080fd5b610a39836109df565b6020808252600e908201526d139bdd08185d5d1a1bdc9a5e995960921b604082015260600190565b634e487b7160e01b600052601160045260246000fd5b808201808211156104f5576104f5610a8b565b80820281158282048414176104f5576104f5610a8b56fea264697066735822122030d2bf5523ccf376b23381ce7f3d4874fe968c0827cb91cdd69445825747fa0764736f6c63430008130033";

// Move mappings - Contract enum: { Null: 0, Rock: 1, Paper: 2, Scissors: 3, Spock: 4, Lizard: 5 }
const MOVES: { [key: number]: string } = {
  0: 'Null',
  1: 'Rock',
  2: 'Paper',
  3: 'Scissors',
  4: 'Spock',
  5: 'Lizard'
};

// Frontend move options (1-5 for user selection)
const FRONTEND_MOVES: { [key: number]: string } = {
  1: 'Rock',
  2: 'Paper',
  3: 'Scissors',
  4: 'Spock',
  5: 'Lizard'
};

interface GameState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    isLoading: false,
    error: null,
    success: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setGameState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setGameState(prev => ({ ...prev, error }));
  }, []);

  const setSuccess = useCallback((success: string | null) => {
    setGameState(prev => ({ ...prev, success }));
  }, []);

  // Generate a random salt for the commitment scheme
  // Using crypto.getRandomValues instead of Math.random for security
  const generateSalt = useCallback(() => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    
    let hexString = '0x';
    for (let i = 0; i < array.length; i++) {
      hexString += array[i].toString(16).padStart(2, '0');
    }
    
    return hexString;
  }, []);

  // Create the commitment hash that matches the contract
  // This needs to match keccak256(abi.encodePacked(move, salt)) exactly
  const createCommitment = useCallback((move: number, salt: string) => {
    const saltBigInt = BigInt(salt);
    const encoded = ethers.solidityPacked(['uint8', 'uint256'], [move, saltBigInt]);
    return ethers.keccak256(encoded);
  }, []);

  // Make sure we're on the right network before any transaction
  const validateNetwork = useCallback(async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== 11155111) {
      throw new Error(`Wrong network! Please switch to Sepolia testnet. Current: ${network.name}`);
    }
  }, []);

  // Create a new game (Player 1)
  const createGame = useCallback(async (
    move: number,
    opponentAddress: string,
    stakeAmount: string,
    account: string
  ) => {
    if (!account) {
      throw new Error('Please connect your wallet first');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate network first
      await validateNetwork();

      // Validate inputs
      if (!move || move < 1 || move > 5) {
        throw new Error('Please select a valid move (1-5)');
      }
      
      if (!ethers.isAddress(opponentAddress)) {
        throw new Error('Invalid opponent address');
      }
      
      if (opponentAddress.toLowerCase() === account.toLowerCase()) {
        throw new Error('You cannot play against yourself');
      }

      // Convert stake to Wei
      const stakeWei = ethers.parseEther(stakeAmount);
      
      if (stakeWei <= 0n) {
        throw new Error('Stake amount must be greater than 0');
      }

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // ✅ Check balance before transaction
      const balance = await provider.getBalance(account);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      const estimatedGas = 500000n; // Rough estimate for contract deployment
      const totalCost = stakeWei + (gasPrice * estimatedGas);
      
      if (balance < totalCost) {
        throw new Error(
          `Insufficient ETH. Need ${ethers.formatEther(totalCost)} ETH ` +
          `(${ethers.formatEther(stakeWei)} stake + ~${ethers.formatEther(gasPrice * estimatedGas)} gas), ` +
          `but you have ${ethers.formatEther(balance)} ETH`
        );
      }

      // Generate salt securely
      const salt = generateSalt();
      console.log('Generated salt:', salt);
      
      // Create commitment
      const commitment = createCommitment(move, salt);
      console.log('Commitment hash:', commitment);
      
      // Deploy new RPS contract
      const RPSFactory = new ethers.ContractFactory(RPS_ABI, RPS_BYTECODE, signer);
      
      // Deploy with constructor parameters: bytes32 _c1Hash, address _j2
      const contract = await RPSFactory.deploy(commitment, opponentAddress, {
        value: stakeWei
      });
      
      const deployTx = contract.deploymentTransaction();
      console.log('Deployment transaction:', deployTx?.hash);
      
      await contract.waitForDeployment();
      const contractAddress = await contract.getAddress();
      
      console.log('Game created at:', contractAddress);
      
      // Store salt in localStorage as backup
      const gameData = {
        contractAddress,
        move,
        salt,
        timestamp: Date.now()
      };
      localStorage.setItem(`game_${contractAddress}`, JSON.stringify(gameData));
      
      setLoading(false);
      setSuccess(`Game created! Contract: ${contractAddress.slice(0, 10)}...`);
      
      return { contractAddress, salt };
      
    } catch (error: any) {
      console.error('Error creating game:', error);
      setLoading(false);
      const txHash = error.transaction?.hash || error.receipt?.hash;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const fullError = txHash 
        ? `${errorMsg}. Tx: https://sepolia.etherscan.io/tx/${txHash}`
        : errorMsg;
      setError(`Failed to create game: ${fullError}`);
      throw error;
    }
  }, [generateSalt, createCommitment, validateNetwork, setLoading, setError, setSuccess]);

  // Load game info for Player 2 to join
  const loadGameInfo = useCallback(async (contractAddress: string, account: string) => {
    if (!ethers.isAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }
    
    setLoading(true);
    setError(null);

    try {
      await validateNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, RPS_ABI, provider);
      
      // Get game details
      const [stake, j1, j2, c2] = await Promise.all([
        contract.stake(),
        contract.j1(),
        contract.j2(),
        contract.c2()
      ]);
      
      // ✅ Just inform - don't throw. Let contract validate on join.
      const player2HasPlayed = Number(c2) > 0;
      
      // Verify current account is player 2
      if (j2.toLowerCase() !== account.toLowerCase()) {
        throw new Error(`You are not player 2 in this game. Player 2: ${j2}`);
      }
      
      setLoading(false);
      
      return {
        stake: ethers.formatEther(stake),
        player1: j1,
        player2: j2,
        player2HasPlayed  // ✅ Just informational
      };
      
    } catch (error) {
      console.error('Error loading game info:', error);
      setLoading(false);
      setError(`Failed to load game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [validateNetwork, setLoading, setError]);

  // Join game and play (Player 2)
  const joinGame = useCallback(async (
    contractAddress: string,
    move: number,
    account: string
  ) => {
    if (!account) {
      throw new Error('Please connect your wallet first');
    }

    setLoading(true);
    setError(null);

    try {
      await validateNetwork();

      if (!move || move < 1 || move > 5) {
        throw new Error('Please select a valid move (1-5)');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);
      
      // Get stake amount
      const stake = await contract.stake();
      
      // ✅ Check balance
      const balance = await provider.getBalance(account);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      const estimatedGas = 200000n; // Estimate for play()
      const totalCost = stake + (gasPrice * estimatedGas);
      
      if (balance < totalCost) {
        throw new Error(
          `Insufficient ETH. Need ${ethers.formatEther(totalCost)} ETH ` +
          `(${ethers.formatEther(stake)} stake + ~${ethers.formatEther(gasPrice * estimatedGas)} gas), ` +
          `but you have ${ethers.formatEther(balance)} ETH`
        );
      }
      
      // Call play function
      const tx = await contract.play(move, {
        value: stake
      });
      
      console.log('Play transaction:', tx.hash);
      
      // ✅ Wait and check receipt
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 0) {
        throw new Error('Transaction reverted! Failed to join game.');
      }
      
      console.log('Play transaction confirmed:', receipt);
      
      setLoading(false);
      setSuccess(`You played ${FRONTEND_MOVES[move]}! Tx: ${tx.hash.slice(0, 10)}... Waiting for Player 1 to reveal...`);
      
    } catch (error: any) {
      console.error('Error joining game:', error);
      setLoading(false);
      const txHash = error.transaction?.hash || error.receipt?.hash;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const fullError = txHash 
        ? `${errorMsg}. Tx: https://sepolia.etherscan.io/tx/${txHash}`
        : errorMsg;
      setError(`Failed to join game: ${fullError}`);
      throw error;
    }
  }, [validateNetwork, setLoading, setError, setSuccess]);

  // Reveal move (Player 1)
  const revealMove = useCallback(async (
    contractAddress: string,
    move: number,
    salt: string,
    account: string
  ) => {
    if (!account) {
      throw new Error('Please connect your wallet first');
    }

    setLoading(true);
    setError(null);

    try {
      await validateNetwork();

      if (!move || move < 1 || move > 5) {
        throw new Error('Please select a valid move (1-5)');
      }
      
      if (!salt || salt.trim() === '') {
        throw new Error('Please enter your salt');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);
      
      // ✅ Remove redundant check - let contract validate
      // The contract will revert if commitment doesn't match
      
      // Call solve function
      const tx = await contract.solve(move, salt);
      console.log('Solve transaction:', tx.hash);
      
      // ✅ Wait and check receipt
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 0) {
        throw new Error('Transaction reverted! Invalid move or salt, or game already resolved.');
      }
      
      console.log('Solve transaction confirmed:', receipt);
      
      // Clean up localStorage
      localStorage.removeItem(`game_${contractAddress}`);
      
      setLoading(false);
      setSuccess(`Move revealed! Game resolved. Tx: ${tx.hash.slice(0, 10)}... Check your wallet for winnings.`);
      
    } catch (error: any) {
      console.error('Error revealing move:', error);
      setLoading(false);
      
      // ✅ Parse the revert reason
      const reason = error.reason || error.message || '';
      const txHash = error.transaction?.hash || error.receipt?.hash;
      
      let errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (reason.includes('Invalid move or salt')) {
        errorMsg = 'Invalid move or salt! The commitment does not match. Double-check your move and salt.';
      }
      
      const fullError = txHash 
        ? `${errorMsg} Tx: https://sepolia.etherscan.io/tx/${txHash}`
        : errorMsg;
      
      setError(`Failed to reveal move: ${fullError}`);
      throw error;
    }
  }, [validateNetwork, setLoading, setError, setSuccess]);

  // Timeout for Player 1 (if Player 2 didn't play)
  const j1Timeout = useCallback(async (contractAddress: string, account: string) => {
    if (!account) {
      throw new Error('Please connect your wallet first');
    }

    setLoading(true);
    setError(null);

    try {
      await validateNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);
      
      const tx = await contract.j2Timeout();
      console.log('Timeout transaction:', tx.hash);
      
      // ✅ Wait and check receipt
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 0) {
        throw new Error('Transaction reverted! Timeout may not be available yet or already claimed.');
      }
      
      console.log('Timeout transaction confirmed:', receipt);
      
      setLoading(false);
      setSuccess(`Timeout claimed! Your stake has been returned. Tx: ${tx.hash.slice(0, 10)}...`);
      
    } catch (error: any) {
      console.error('Error claiming timeout:', error);
      setLoading(false);
      const txHash = error.transaction?.hash || error.receipt?.hash;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const fullError = txHash 
        ? `${errorMsg} Tx: https://sepolia.etherscan.io/tx/${txHash}`
        : errorMsg;
      setError(`Failed to claim timeout: ${fullError}`);
      throw error;
    }
  }, [validateNetwork, setLoading, setError, setSuccess]);

  // Timeout for Player 2 (if Player 1 didn't reveal)
  const j2Timeout = useCallback(async (contractAddress: string, account: string) => {
    if (!account) {
      throw new Error('Please connect your wallet first');
    }

    setLoading(true);
    setError(null);

    try {
      await validateNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);
      
      const tx = await contract.j1Timeout();
      console.log('Timeout transaction:', tx.hash);
      
      // ✅ Wait and check receipt
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 0) {
        throw new Error('Transaction reverted! Timeout may not be available yet or already claimed.');
      }
      
      console.log('Timeout transaction confirmed:', receipt);
      
      setLoading(false);
      setSuccess(`Timeout claimed! You won by timeout. Tx: ${tx.hash.slice(0, 10)}...`);
      
    } catch (error: any) {
      console.error('Error claiming timeout:', error);
      setLoading(false);
      const txHash = error.transaction?.hash || error.receipt?.hash;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const fullError = txHash 
        ? `${errorMsg} Tx: https://sepolia.etherscan.io/tx/${txHash}`
        : errorMsg;
      setError(`Failed to claim timeout: ${fullError}`);
      throw error;
    }
  }, [validateNetwork, setLoading, setError, setSuccess]);

  // Check game state
  const checkGameState = useCallback(async (contractAddress: string) => {
    if (!ethers.isAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }

    setLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, RPS_ABI, provider);
      
      // Get all game data
      const [stake, j1, j2, c1Hash, c2, lastAction, timeout] = await Promise.all([
        contract.stake(),
        contract.j1(),
        contract.j2(),
        contract.c1Hash(),
        contract.c2(),
        contract.lastAction(),
        contract.TIMEOUT()
      ]);
      
      // Calculate timeout status
      const currentTime = Math.floor(Date.now() / 1000);
      const timeoutTime = Number(lastAction) + Number(timeout);
      const timeRemaining = timeoutTime - currentTime;
      
      // Determine game status
      let status = 'Unknown';
      if (Number(c2) === 0) {  // ✅ Fixed BigInt comparison
        status = 'Waiting for Player 2 to play';
      } else {
        status = 'Waiting for Player 1 to reveal';
      }
      
      setLoading(false);
      
      return {
        contractAddress,
        stake: ethers.formatEther(stake),
        player1: j1,
        player2: j2,
        commitment: c1Hash,
        player2Move: c2 > 0 ? MOVES[c2] : 'Not played yet',
        status,
        lastAction: new Date(Number(lastAction) * 1000).toLocaleString(),
        timeoutPeriod: `${Number(timeout)} seconds (${Math.floor(Number(timeout) / 60)} minutes)`,
        timeRemaining: timeRemaining > 0 ? `${Math.floor(timeRemaining / 60)} minutes` : 'Timeout available'
      };
      
    } catch (error) {
      console.error('Error checking game state:', error);
      setLoading(false);
      setError(`Failed to check game state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [setLoading, setError]);

  return {
    ...gameState,
    createGame,
    loadGameInfo,
    joinGame,
    revealMove,
    j1Timeout,
    j2Timeout,
    checkGameState,
    clearMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};
