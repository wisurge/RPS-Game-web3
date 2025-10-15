'use client';

import { useState, useEffect, useCallback } from 'react';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3State {
  account: string | null;
  networkId: number | null;
  networkName: string;
  isConnected: boolean;
  isLoading: boolean;
}

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    account: null,
    networkId: null,
    networkName: 'Not Connected',
    isConnected: false,
    isLoading: false,
  });

  const getNetworkName = (chainId: number): string => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten',
      4: 'Rinkeby',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai'
    };
    return networks[chainId] || `Unknown (${chainId})`;
  };

  const isCorrectNetwork = (chainId: number): boolean => {
    return chainId === 11155111; // Sepolia testnet
  };

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this dApp!');
    }

    try {
      setWeb3State(prev => ({ ...prev, isLoading: true }));
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = parseInt(chainId, 16);
      
      // Check if on correct network
      if (!isCorrectNetwork(networkId)) {
        throw new Error(`Please switch to Sepolia testnet (Chain ID: 11155111). Current network: ${getNetworkName(networkId)}`);
      }
      
      setWeb3State({
        account: accounts[0],
        networkId,
        networkName: getNetworkName(networkId),
        isConnected: true,
        isLoading: false,
      });

      return accounts[0];
    } catch (error) {
      setWeb3State(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        const networkId = parseInt(chainId, 16);
        setWeb3State({
          account: accounts[0],
          networkId,
          networkName: getNetworkName(networkId),
          isConnected: isCorrectNetwork(networkId),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWeb3State(prev => ({
          ...prev,
          account: null,
          isConnected: false,
          networkName: 'Not Connected',
        }));
      } else {
        setWeb3State(prev => ({
          ...prev,
          account: accounts[0],
        }));
      }
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkConnection]);

  const switchToSepolia = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this dApp!');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
      });
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
          }],
        });
      } else {
        throw error;
      }
    }
  }, []);

  return {
    ...web3State,
    connectWallet,
    checkConnection,
    switchToSepolia,
    isCorrectNetwork: (chainId: number) => isCorrectNetwork(chainId),
  };
};
