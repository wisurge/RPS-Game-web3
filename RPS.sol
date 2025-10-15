// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Hasher
 * @dev Helper contract to create commitment hashes
 */
contract Hasher {
    function hash(uint8 _c, uint256 _salt) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_c, _salt));
    }
}

/**
 * @title RPS
 * @dev Rock Paper Scissors Lizard Spock game contract
 * This contract is deployed per game instance
 */
contract RPS is Hasher {
    
    enum Move { Null, Rock, Paper, Scissors, Spock, Lizard }
    
    address payable public j1;
    address payable public j2;
    bytes32 public c1Hash;
    Move public c2;
    uint256 public stake;
    uint256 public lastAction;
    uint256 public constant TIMEOUT = 5 minutes;
    
    modifier onlyPlayer(address player) {
        require(msg.sender == player, "Not authorized");
        _;
    }
    
    /**
     * @dev Constructor - Player 1 creates the game
     * @param _c1Hash Commitment hash of player 1's move
     * @param _j2 Address of player 2
     */
    constructor(bytes32 _c1Hash, address payable _j2) payable {
        require(msg.value > 0, "Stake must be positive");
        require(_j2 != address(0) && _j2 != msg.sender, "Invalid player 2 address");
        
        j1 = payable(msg.sender);
        j2 = _j2;
        c1Hash = _c1Hash;
        stake = msg.value;
        lastAction = block.timestamp;
    }
    
    /**
     * @dev Player 2 plays their move
     * @param _c2 Player 2's move (1-5)
     */
    function play(Move _c2) external payable onlyPlayer(j2) {
        require(c2 == Move.Null, "Player 2 already played");
        require(_c2 > Move.Null && _c2 <= Move.Lizard, "Invalid move");
        require(msg.value == stake, "Incorrect stake amount");
        
        c2 = _c2;
        lastAction = block.timestamp;
    }
    
    /**
     * @dev Player 1 reveals their move and resolves the game
     * @param _c1 Player 1's actual move
     * @param _salt The salt used to create the commitment
     */
    function solve(Move _c1, uint256 _salt) external onlyPlayer(j1) {
        require(c2 != Move.Null, "Player 2 has not played yet");
        require(hash(uint8(_c1), _salt) == c1Hash, "Invalid move or salt");
        
        uint256 payout = determineWinner(_c1, c2);
        
        if (payout == 1) {
            // Player 1 wins
            j1.transfer(2 * stake);
        } else if (payout == 2) {
            // Player 2 wins
            j2.transfer(2 * stake);
        } else {
            // Tie - split the stakes
            j1.transfer(stake);
            j2.transfer(stake);
        }
    }
    
    /**
     * @dev Determine the winner of the game
     * @param _c1 Player 1's move
     * @param _c2 Player 2's move
     * @return 1 if player 1 wins, 2 if player 2 wins, 0 if tie
     */
    function determineWinner(Move _c1, Move _c2) private pure returns(uint256) {
        if (_c1 == _c2) return 0; // Tie
        
        if (_c1 == Move.Rock) {
            if (_c2 == Move.Scissors || _c2 == Move.Lizard) return 1;
            return 2;
        }
        if (_c1 == Move.Paper) {
            if (_c2 == Move.Rock || _c2 == Move.Spock) return 1;
            return 2;
        }
        if (_c1 == Move.Scissors) {
            if (_c2 == Move.Paper || _c2 == Move.Lizard) return 1;
            return 2;
        }
        if (_c1 == Move.Spock) {
            if (_c2 == Move.Scissors || _c2 == Move.Rock) return 1;
            return 2;
        }
        if (_c1 == Move.Lizard) {
            if (_c2 == Move.Spock || _c2 == Move.Paper) return 1;
            return 2;
        }
        
        return 0;
    }
    
    /**
     * @dev Player 1 can claim timeout if Player 2 doesn't play
     */
    function j2Timeout() external onlyPlayer(j1) {
        require(c2 == Move.Null, "Player 2 has already played");
        require(block.timestamp >= lastAction + TIMEOUT, "Timeout not reached");
        
        j1.transfer(stake);
    }
    
    /**
     * @dev Player 2 can claim timeout if Player 1 doesn't reveal
     */
    function j1Timeout() external onlyPlayer(j2) {
        require(c2 != Move.Null, "Player 2 has not played yet");
        require(block.timestamp >= lastAction + TIMEOUT, "Timeout not reached");
        
        j2.transfer(2 * stake);
    }
}


