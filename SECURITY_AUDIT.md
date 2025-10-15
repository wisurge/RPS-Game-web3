# Security Audit Report - RPSLS dApp

**Date:** October 15, 2025  
**Auditor:** AI Security Analysis  
**Scope:** Smart Contract (RPS.sol) and Web3 Integration (useGame.ts, useWeb3.ts)

---

## Executive Summary

This audit identified **1 CRITICAL**, **2 HIGH**, and **3 MEDIUM** severity issues in the smart contract and its integration.

### Critical Issues: 1

### High Issues: 2

### Medium Issues: 3

### Low Issues: 2

---

## 🔴 CRITICAL ISSUES

### [C-1] Reentrancy Vulnerability in `solve()` Function

**Severity:** CRITICAL  
**File:** RPS.sol (lines 70-87)  
**Status:** VULNERABLE

**Description:**
The `solve()` function transfers funds to players BEFORE the game state is properly finalized. This violates the Checks-Effects-Interactions pattern and could allow reentrancy attacks.

**Vulnerable Code:**

```solidity
function solve(Move _c1, uint256 _salt) external onlyPlayer(j1) {
    require(c2 != Move.Null, "Player 2 has not played yet");
    require(hash(uint8(_c1), _salt) == c1Hash, "Invalid move or salt");

    uint256 payout = determineWinner(_c1, c2);

    if (payout == 1) {
        j1.transfer(2 * stake);  // ❌ External call before state change
    } else if (payout == 2) {
        j2.transfer(2 * stake);  // ❌ External call before state change
    } else {
        j1.transfer(stake);      // ❌ External call before state change
        j2.transfer(stake);      // ❌ External call before state change
    }
}
```

**Impact:**

- Malicious contract as j1 or j2 could re-enter and potentially drain funds
- Game state remains unchanged after transfers, allowing repeated calls
- Funds could be stolen from the contract

**Proof of Concept:**

1. Attacker deploys malicious contract with fallback function
2. Attacker uses malicious contract as player address
3. When `transfer()` is called, fallback function re-enters `solve()`
4. Funds transferred multiple times

**Recommendation:**

1. Add a game state variable to track if game is resolved
2. Set state BEFORE making transfers
3. Use withdrawal pattern instead of direct transfers

**Fixed Code:**

```solidity
bool public resolved;  // Add this state variable

function solve(Move _c1, uint256 _salt) external onlyPlayer(j1) {
    require(!resolved, "Game already resolved");  // Check first
    require(c2 != Move.Null, "Player 2 has not played yet");
    require(hash(uint8(_c1), _salt) == c1Hash, "Invalid move or salt");

    resolved = true;  // ✅ Effect - set state before transfer
    uint256 payout = determineWinner(_c1, c2);

    // ✅ Interaction - external calls last
    if (payout == 1) {
        j1.transfer(2 * stake);
    } else if (payout == 2) {
        j2.transfer(2 * stake);
    } else {
        j1.transfer(stake);
        j2.transfer(stake);
    }
}
```

---

## 🟠 HIGH SEVERITY ISSUES

### [H-1] Timeout Functions Can Be Called Multiple Times

**Severity:** HIGH  
**File:** RPS.sol (lines 125-140)  
**Status:** VULNERABLE

**Description:**
Both `j1Timeout()` and `j2Timeout()` lack state management to prevent multiple calls. After a timeout is claimed, the functions can potentially be called again.

**Vulnerable Code:**

```solidity
function j2Timeout() external onlyPlayer(j1) {
    require(c2 == Move.Null, "Player 2 has already played");
    require(block.timestamp >= lastAction + TIMEOUT, "Timeout not reached");

    j1.transfer(stake);  // ❌ No state change to prevent re-calling
}

function j1Timeout() external onlyPlayer(j2) {
    require(c2 != Move.Null, "Player 2 has not played yet");
    require(block.timestamp >= lastAction + TIMEOUT, "Timeout not reached");

    j2.transfer(2 * stake);  // ❌ No state change to prevent re-calling
}
```

**Impact:**

- After claiming timeout, the contract still has a non-zero balance
- While `stake` is not reset, the checks might not prevent edge cases
- Contract could be in an inconsistent state

**Recommendation:**
Add a `resolved` flag and check/set it in timeout functions.

**Fixed Code:**

```solidity
bool public resolved;

function j2Timeout() external onlyPlayer(j1) {
    require(!resolved, "Game already resolved");
    require(c2 == Move.Null, "Player 2 has already played");
    require(block.timestamp >= lastAction + TIMEOUT, "Timeout not reached");

    resolved = true;
    j1.transfer(stake);
}

function j1Timeout() external onlyPlayer(j2) {
    require(!resolved, "Game already resolved");
    require(c2 != Move.Null, "Player 2 has not played yet");
    require(block.timestamp >= lastAction + TIMEOUT, "Timeout not reached");

    resolved = true;
    j2.transfer(2 * stake);
}
```

### [H-2] No Validation of Move in Reveal Function

**Severity:** HIGH  
**File:** RPS.sol (line 70)  
**Status:** VULNERABLE

**Description:**
The `solve()` function doesn't validate that `_c1` is within the valid move range (1-5). While the hash check provides some protection, explicitly validating inputs is a security best practice.

**Vulnerable Code:**

```solidity
function solve(Move _c1, uint256 _salt) external onlyPlayer(j1) {
    require(c2 != Move.Null, "Player 2 has not played yet");
    require(hash(uint8(_c1), _salt) == c1Hash, "Invalid move or salt");
    // ❌ No check that _c1 is valid (1-5)

    uint256 payout = determineWinner(_c1, c2);
    // ...
}
```

**Impact:**

- Player 1 could pass `Move.Null` (0) or invalid values
- Could cause unexpected behavior in `determineWinner()`
- Although hash mismatch would catch most cases, explicit validation is safer

**Recommendation:**
Add explicit validation for the move range.

**Fixed Code:**

```solidity
function solve(Move _c1, uint256 _salt) external onlyPlayer(j1) {
    require(c2 != Move.Null, "Player 2 has not played yet");
    require(_c1 > Move.Null && _c1 <= Move.Lizard, "Invalid move");  // ✅ Add this
    require(hash(uint8(_c1), _salt) == c1Hash, "Invalid move or salt");

    uint256 payout = determineWinner(_c1, c2);
    // ...
}
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### [M-1] Frontend Move Mapping Inconsistency Risk

**Severity:** MEDIUM  
**File:** useGame.ts (lines 196-213), app/page.tsx (lines 14-20)  
**Status:** POTENTIAL ISSUE

**Description:**
The frontend uses 1-5 for move selection but the contract uses 1-5 for the enum. However, the mapping is handled correctly in `createCommitment()` and `joinGame()` functions. This is not a current bug but presents a maintenance risk.

**Current Implementation:**

```typescript
// Frontend move options (users select 1-5)
const MOVE_OPTIONS = [
  { value: "1", label: "Rock" },
  { value: "2", label: "Paper" },
  { value: "3", label: "Scissors" },
  { value: "4", label: "Spock" },
  { value: "5", label: "Lizard" },
];

// Contract enum: { Null: 0, Rock: 1, Paper: 2, Scissors: 3, Spock: 4, Lizard: 5 }
```

**Current Status:** ✅ CORRECTLY HANDLED
The values are passed directly to the contract which expects 1-5, so this is correct.

**Recommendation:**
Add explicit comments in the code to prevent future developers from "fixing" this.

```typescript
// NOTE: Move values 1-5 map directly to contract enum
// Contract: { Null: 0, Rock: 1, Paper: 2, Scissors: 3, Spock: 4, Lizard: 5 }
// Frontend: Users select 1-5, which matches the contract perfectly
const MOVE_OPTIONS = [
  { value: "1", label: "Rock" }, // Contract: Move.Rock = 1
  { value: "2", label: "Paper" }, // Contract: Move.Paper = 2
  { value: "3", label: "Scissors" }, // Contract: Move.Scissors = 3
  { value: "4", label: "Spock" }, // Contract: Move.Spock = 4
  { value: "5", label: "Lizard" }, // Contract: Move.Lizard = 5
];
```

### [M-2] Salt Generation Uses Client-Side Randomness

**Severity:** MEDIUM  
**File:** useGame.ts (lines 241-253)  
**Status:** ACCEPTABLE BUT NOTED

**Description:**
The salt is generated using `window.crypto.getRandomValues()` which is client-side. While this is cryptographically secure for browser environments, it relies on the client's implementation.

**Current Implementation:**

```typescript
const generateSalt = useCallback(() => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array); // ✅ This is secure

  let hexString = "0x";
  for (let i = 0; i < array.length; i++) {
    hexString += array[i].toString(16).padStart(2, "0");
  }

  return BigInt(hexString).toString();
}, []);
```

**Status:** ✅ ACCEPTABLE
`window.crypto.getRandomValues()` is cryptographically secure and appropriate for this use case.

**Recommendation:**
No changes needed. This is the correct approach for browser-based salt generation.

### [M-3] No Check for Zero Stake Amount

**Severity:** MEDIUM  
**File:** RPS.sol (line 42)  
**Status:** PROTECTED

**Description:**
The contract requires `msg.value > 0` which prevents zero-stake games. This is good, but the frontend should also validate this before attempting deployment.

**Current Contract Code:**

```solidity
constructor(bytes32 _c1Hash, address payable _j2) payable {
    require(msg.value > 0, "Stake must be positive");  // ✅ Good
    // ...
}
```

**Frontend Code:**

```typescript
// Current validation in app/page.tsx
<Input
  type="number"
  step="0.001"
  min="0.001" // ✅ Good - enforces minimum
  placeholder="0.01"
  // ...
/>
```

**Status:** ✅ ADEQUATELY HANDLED
Both contract and frontend have protection.

**Recommendation:**
Consider adding an explicit frontend validation in the `createGame` function:

```typescript
const createGame = useCallback(async (...) => {
  // Add this check
  const stakeWei = ethers.parseEther(stakeAmount);
  if (stakeWei <= 0n) {
    throw new Error('Stake amount must be greater than 0');
  }
  // ...
}, []);
```

---

## 🔵 LOW SEVERITY ISSUES

### [L-1] No Event Emissions

**Severity:** LOW  
**File:** RPS.sol  
**Status:** MISSING FEATURE

**Description:**
The contract doesn't emit any events for game creation, moves, or resolution. Events are important for:

- Off-chain indexing and game tracking
- Frontend monitoring of game state
- Debugging and transparency

**Recommendation:**
Add events to track game lifecycle:

```solidity
event GameCreated(address indexed j1, address indexed j2, uint256 stake);
event Player2Played(address indexed j2, Move move);
event GameResolved(address indexed winner, uint256 amount);
event TimeoutClaimed(address indexed claimer, uint256 amount);

// Emit in appropriate functions
constructor(...) {
    // ...
    emit GameCreated(msg.sender, _j2, msg.value);
}

function play(Move _c2) external payable onlyPlayer(j2) {
    // ...
    emit Player2Played(msg.sender, _c2);
}

function solve(Move _c1, uint256 _salt) external onlyPlayer(j1) {
    // ...
    emit GameResolved(winner_address, payout_amount);
}
```

### [L-2] Hardcoded Timeout Value

**Severity:** LOW  
**File:** RPS.sol (line 29)  
**Status:** ACCEPTABLE

**Description:**
The timeout is hardcoded to 5 minutes. For a production system, this might need to be configurable per game.

**Current Code:**

```solidity
uint256 public constant TIMEOUT = 5 minutes;
```

**Status:** ✅ ACCEPTABLE FOR TESTNET
For a testnet/demo, a fixed timeout is fine.

**Recommendation (Optional):**
For production, consider making timeout configurable:

```solidity
uint256 public immutable TIMEOUT;

constructor(bytes32 _c1Hash, address payable _j2, uint256 _timeout) payable {
    require(_timeout >= 1 minutes && _timeout <= 1 days, "Invalid timeout");
    TIMEOUT = _timeout;
    // ...
}
```

---

## ✅ POSITIVE FINDINGS

### What Was Done Correctly:

1. **Commitment Scheme** ✅

   - Properly uses keccak256(abi.encodePacked(move, salt))
   - Frontend correctly replicates this with `ethers.solidityPacked()`
   - Salt is 256-bit cryptographically secure random

2. **Address Validation** ✅

   - Prevents player from playing against themselves
   - Validates player 2 address is not zero address
   - Checks that correct player is calling each function

3. **Access Control** ✅

   - `onlyPlayer` modifier properly restricts function access
   - Each player can only call their designated functions

4. **Move Validation** ✅

   - Player 2's move is validated in `play()` function
   - Range check ensures move is between 1-5

5. **Winner Determination** ✅

   - Logic correctly implements RPSLS rules
   - All win conditions properly covered

6. **Stake Matching** ✅

   - Player 2 must match Player 1's stake exactly
   - Both players risk equal amounts

7. **Timeout Mechanism** ✅

   - Both players have timeout protection
   - 5 minutes is reasonable for testnet
   - Timestamp-based mechanism is secure

8. **Frontend Integration** ✅
   - Correct ABI and bytecode integration
   - Proper transaction handling with wait confirmations
   - Good error handling and user feedback
   - Network validation (Sepolia only)
   - LocalStorage backup for salt

---

## CRITICAL FIXES REQUIRED

### Priority 1 (MUST FIX BEFORE MAINNET):

1. **Add reentrancy protection to `solve()`**

   - Add `resolved` state variable
   - Set state before transfers

2. **Add reentrancy protection to timeout functions**

   - Check `resolved` state
   - Set state before transfers

3. **Add move validation in `solve()`**
   - Validate `_c1` is in range 1-5

### Priority 2 (RECOMMENDED):

4. **Add event emissions** for better transparency and indexing
5. **Consider withdrawal pattern** instead of direct transfers for added security

---

## TESTING RECOMMENDATIONS

### Required Tests:

1. **Reentrancy Attack Test**

   - Deploy malicious contract as player
   - Attempt to re-enter during `solve()`
   - Verify attack is blocked with fixes

2. **Multiple Timeout Claims Test**

   - Call timeout function twice
   - Verify second call fails

3. **Invalid Move Test**

   - Try to reveal with Move.Null (0)
   - Try to reveal with invalid value (6+)
   - Verify all rejected

4. **Commitment Integrity Test**

   - Verify frontend hash matches contract hash
   - Test with various move/salt combinations

5. **Edge Cases**
   - Zero stake (should fail)
   - Playing against self (should fail)
   - Invalid addresses (should fail)

---

## CONCLUSION

The dApp has a **solid foundation** with proper commitment scheme, access control, and game logic. However, there are **critical reentrancy vulnerabilities** that must be fixed before any mainnet deployment.

### Risk Summary:

- **Testnet Use:** Medium Risk (acceptable with warnings)
- **Mainnet Use:** HIGH RISK (DO NOT DEPLOY without fixes)

### Recommended Actions:

1. ✅ Deploy fixed contract with reentrancy protection
2. ✅ Add comprehensive tests
3. ✅ Consider professional audit before mainnet
4. ✅ Add events for better UX
5. ✅ Document security assumptions

---

**Note:** This smart contract was provided as part of a coding exercise and cannot be modified per requirements. However, for any real deployment, these fixes are CRITICAL.
