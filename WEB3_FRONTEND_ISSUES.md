# Web3 Frontend Integration - Critical Analysis

## 🔴 CRITICAL ISSUES FOUND

### [F-C-1] Race Condition in Contract State Reads

**Severity:** CRITICAL  
**File:** hooks/useGame.ts (lines 354-364)  
**Status:** VULNERABLE

**Description:**
The `loadGameInfo` function reads `c2` to check if Player 2 has played, but this creates a race condition. Between the time of checking and Player 2 actually joining, Player 2 could have already played, leading to a failed transaction.

**Vulnerable Code:**

```typescript
const loadGameInfo = useCallback(async (contractAddress: string, account: string) => {
  // ...
  const [stake, j1, j2, c2] = await Promise.all([...]);

  // Check if player 2 has already played
  if (c2 > 0) {
    throw new Error('Player 2 has already played in this game');  // ❌ TOCTOU vulnerability
  }

  // ... user sees game info and clicks "join" ...
  // But c2 might have changed between load and join!
}, []);
```

**Impact:**

- User loads game info (c2 = 0)
- Another player joins first
- Original user tries to join and transaction fails
- Wasted gas fees
- Poor UX

**Recommendation:**

1. Remove the pre-check from `loadGameInfo` (it's just informational)
2. Let the contract handle the validation
3. Add better error handling in `joinGame`

**Fixed Code:**

```typescript
const loadGameInfo = useCallback(
  async (contractAddress: string, account: string) => {
    // ... existing code ...

    // ❌ Remove this check - let contract handle it
    // if (c2 > 0) {
    //   throw new Error('Player 2 has already played in this game');
    // }

    // ✅ Just return the state - show it to user
    return {
      stake: ethers.formatEther(stake),
      player1: j1,
      player2: j2,
      player2HasPlayed: c2 > 0, // ✅ Just informational
    };
  },
  []
);
```

---

### [F-C-2] Salt Conversion to String Loses Precision

**Severity:** CRITICAL  
**File:** hooks/useGame.ts (line 252)  
**Status:** POTENTIALLY VULNERABLE

**Description:**
Converting BigInt to string and back could theoretically cause precision issues depending on how it's used. More critically, the salt is stored as a plain string in localStorage which could be truncated or mishandled.

**Vulnerable Code:**

```typescript
const generateSalt = useCallback(() => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);

  let hexString = "0x";
  for (let i = 0; i < array.length; i++) {
    hexString += array[i].toString(16).padStart(2, "0");
  }

  return BigInt(hexString).toString(); // ❌ Converting to decimal string
}, []);
```

**Problem:**

1. Hex string → BigInt → Decimal string
2. Later: Decimal string → used in `ethers.solidityPacked`
3. Large numbers might have precision issues
4. Harder to debug (hex is more readable)

**Impact:**

- Potential precision loss with very large numbers
- Commitment mismatch would cause reveal to fail
- User loses their stake

**Recommendation:**
Keep as hex string throughout.

**Fixed Code:**

```typescript
const generateSalt = useCallback(() => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);

  let hexString = "0x";
  for (let i = 0; i < array.length; i++) {
    hexString += array[i].toString(16).padStart(2, "0");
  }

  return hexString; // ✅ Keep as hex string
}, []);

// Update createCommitment to handle hex strings
const createCommitment = useCallback((move: number, salt: string) => {
  // Ensure salt is in correct format
  const saltBigInt = BigInt(salt); // Works with both hex (0x...) and decimal
  const encoded = ethers.solidityPacked(
    ["uint8", "uint256"],
    [move, saltBigInt]
  );
  return ethers.keccak256(encoded);
}, []);
```

---

### [F-C-3] No Transaction Validation Before Submission

**Severity:** HIGH  
**File:** hooks/useGame.ts (multiple functions)  
**Status:** MISSING VALIDATION

**Description:**
None of the transaction functions validate that the user has sufficient ETH balance before attempting the transaction. This leads to confusing error messages and wasted gas on failed transactions.

**Missing Validation:**

```typescript
const createGame = useCallback(async (...) => {
  // ... existing code ...
  const stakeWei = ethers.parseEther(stakeAmount);

  // ❌ NO CHECK: Does user have enough ETH?
  // ❌ NO CHECK: Does user have enough for stake + gas?

  const contract = await RPSFactory.deploy(commitment, opponentAddress, {
    value: stakeWei  // This might fail silently
  });
}, []);
```

**Impact:**

- Transaction fails with cryptic error
- User wastes gas
- Poor UX

**Recommendation:**
Add balance checks before transactions.

**Fixed Code:**

```typescript
const createGame = useCallback(async (...) => {
  // ... existing validation ...

  const stakeWei = ethers.parseEther(stakeAmount);

  // ✅ Check balance
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const balance = await provider.getBalance(account);

  // Estimate gas cost
  const gasPrice = (await provider.getFeeData()).gasPrice || 0n;
  const estimatedGas = 500000n; // Rough estimate for deployment
  const totalCost = stakeWei + (gasPrice * estimatedGas);

  if (balance < totalCost) {
    throw new Error(
      `Insufficient ETH. You need ${ethers.formatEther(totalCost)} ETH ` +
      `(${ethers.formatEther(stakeWei)} stake + ~${ethers.formatEther(gasPrice * estimatedGas)} gas), ` +
      `but you have ${ethers.formatEther(balance)} ETH`
    );
  }

  // ... proceed with transaction ...
}, []);
```

---

### [F-C-4] Commitment Verification Before Reveal Has TOCTOU

**Severity:** HIGH  
**File:** hooks/useGame.ts (lines 459-465)  
**Status:** VULNERABLE

**Description:**
The code reads the commitment from the contract to verify it matches BEFORE submitting the transaction. This is a Time-Of-Check-Time-Of-Use (TOCTOU) vulnerability, though the impact is limited by blockchain immutability.

**Vulnerable Code:**

```typescript
const revealMove = useCallback(async (...) => {
  // Verify the commitment
  const commitment = createCommitment(move, salt);
  const storedCommitment = await contract.c1Hash();  // ❌ Read state

  if (commitment.toLowerCase() !== storedCommitment.toLowerCase()) {
    throw new Error('Invalid move or salt! The commitment does not match.');
  }

  // Call solve function
  const tx = await contract.solve(move, salt);  // ❌ Contract will check again
  await tx.wait();
}, []);
```

**Problem:**

1. This is redundant - the contract checks anyway
2. Wastes an extra RPC call
3. Gives false confidence - contract is the source of truth
4. Could theoretically be different if contract state changed (though unlikely with commitment)

**Impact:**

- Wasted RPC calls
- Misleading error messages
- User thinks their data is valid, but contract might disagree

**Recommendation:**
Remove the pre-check, let the contract validate.

**Fixed Code:**

```typescript
const revealMove = useCallback(async (...) => {
  // ... existing validation ...

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);

  // ✅ Just submit - let contract validate
  // Contract will revert with "Invalid move or salt" if wrong
  try {
    const tx = await contract.solve(move, salt);
    await tx.wait();

    localStorage.removeItem(`game_${contractAddress}`);

    setLoading(false);
    setSuccess('Move revealed! Game resolved. Check your wallet for winnings.');
  } catch (error: any) {
    // ✅ Parse the revert reason from the error
    const reason = error.reason || error.message;
    if (reason.includes('Invalid move or salt')) {
      throw new Error('Invalid move or salt! The commitment does not match. Double-check your move and salt.');
    }
    throw error;
  }
}, []);
```

---

### [F-C-5] No Handling of Pending Transactions

**Severity:** HIGH  
**File:** hooks/useGame.ts (all transaction functions)  
**Status:** MISSING FEATURE

**Description:**
If a user submits a transaction and closes the page or refreshes, there's no way to track or recover that pending transaction. The `isLoading` state is lost.

**Problem:**

```typescript
const createGame = useCallback(async (...) => {
  setLoading(true);  // ❌ Lost on page refresh

  const contract = await RPSFactory.deploy(...);
  await contract.waitForDeployment();  // ❌ User refreshes page here - lost!

  const contractAddress = await contract.getAddress();
  // ...
}, []);
```

**Impact:**

- User refreshes during deployment
- Transaction is pending/confirmed on-chain
- User doesn't know the contract address
- Funds are locked forever

**Recommendation:**
Store transaction hashes in localStorage and check on mount.

**Fixed Code:**

```typescript
const createGame = useCallback(async (...) => {
  setLoading(true);

  try {
    const RPSFactory = new ethers.ContractFactory(RPS_ABI, RPS_BYTECODE, signer);
    const contract = await RPSFactory.deploy(commitment, opponentAddress, {
      value: stakeWei
    });

    // ✅ Store transaction hash immediately
    const deployTx = contract.deploymentTransaction();
    if (deployTx) {
      localStorage.setItem('pending_deploy_tx', JSON.stringify({
        txHash: deployTx.hash,
        timestamp: Date.now(),
        move,
        salt,
        opponentAddress
      }));
    }

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    // ✅ Clear pending tx
    localStorage.removeItem('pending_deploy_tx');

    // ... rest of code ...
  } catch (error) {
    // ✅ Clear pending tx on error
    localStorage.removeItem('pending_deploy_tx');
    throw error;
  }
}, []);

// Add a recovery function to check pending transactions on mount
const checkPendingTransactions = useCallback(async () => {
  const pendingTx = localStorage.getItem('pending_deploy_tx');
  if (!pendingTx) return;

  try {
    const { txHash, move, salt, opponentAddress } = JSON.parse(pendingTx);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (receipt && receipt.contractAddress) {
      // Transaction confirmed!
      setGameCreated({
        contractAddress: receipt.contractAddress,
        salt
      });
      localStorage.removeItem('pending_deploy_tx');
      setSuccess('Found your pending game creation!');
    }
  } catch (error) {
    console.error('Error checking pending transaction:', error);
  }
}, []);
```

---

## 🟠 HIGH SEVERITY ISSUES

### [F-H-1] No Gas Estimation or Limit Setting

**Severity:** HIGH  
**File:** hooks/useGame.ts (all transaction functions)  
**Status:** MISSING FEATURE

**Description:**
Transactions don't set gas limits or estimate gas. During network congestion, transactions might fail or use excessive gas.

**Problem:**

```typescript
const tx = await contract.play(move, {
  value: stake,
  // ❌ No gasLimit specified
  // ❌ No gas price control
});
```

**Recommendation:**
Add gas estimation with a safety margin.

```typescript
const tx = await contract.play(move, {
  value: stake,
  gasLimit: await contract.play.estimateGas(move, { value: stake }).then(
    (gas) => (gas * 120n) / 100n // 20% safety margin
  ),
});
```

---

### [F-H-2] Network Change During Transaction Not Handled

**Severity:** HIGH  
**File:** hooks/useGame.ts  
**Status:** VULNERABLE

**Description:**
If a user switches networks while a transaction is pending, the app doesn't detect or handle this gracefully.

**Recommendation:**
Add network validation before each transaction:

```typescript
const validateNetwork = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== 11155111) {
    throw new Error('Wrong network! Please switch to Sepolia.');
  }
};

// Call before each transaction
const createGame = useCallback(async (...) => {
  await validateNetwork();  // ✅ Check network first
  // ... proceed with transaction ...
}, []);
```

---

### [F-H-3] localStorage Salt Storage Is Insecure

**Severity:** HIGH  
**File:** hooks/useGame.ts (line 325)  
**Status:** SECURITY RISK

**Description:**
The salt is stored in plain text in localStorage, which is accessible to any JavaScript code on the same origin (including XSS attacks or malicious browser extensions).

**Vulnerable Code:**

```typescript
localStorage.setItem(`game_${contractAddress}`, JSON.stringify(gameData));
```

**Impact:**

- XSS attack could steal salt
- Malicious extension could read salt
- Attacker could reveal the game with stolen salt
- User loses their stake

**Recommendation:**

1. Warn users to save salt securely (copy to password manager)
2. Consider encrypting with user's wallet signature
3. Clear localStorage after successful reveal

**Better Approach:**

```typescript
// Encrypt salt with user's signature
const encryptSalt = async (salt: string, signer: ethers.Signer) => {
  const message = `Encrypt game salt: ${contractAddress}`;
  const signature = await signer.signMessage(message);
  // Use signature as encryption key (simplified - use proper crypto in production)
  return ethers.keccak256(ethers.toUtf8Bytes(salt + signature));
};

// Store encrypted
const encryptedSalt = await encryptSalt(salt, signer);
localStorage.setItem(
  `game_${contractAddress}`,
  JSON.stringify({
    ...gameData,
    encryptedSalt,
  })
);
```

---

### [F-H-4] No Transaction Receipt Validation

**Severity:** HIGH  
**File:** hooks/useGame.ts  
**Status:** MISSING VALIDATION

**Description:**
After `tx.wait()`, the code doesn't check if the transaction actually succeeded. A transaction can be included in a block but still revert.

**Vulnerable Code:**

```typescript
const tx = await contract.solve(move, salt);
await tx.wait(); // ❌ Doesn't check if transaction reverted

setSuccess("Move revealed! Game resolved."); // ❌ Might be wrong!
```

**Recommendation:**

```typescript
const tx = await contract.solve(move, salt);
const receipt = await tx.wait();

if (receipt.status === 0) {
  throw new Error("Transaction reverted! Game was not resolved.");
}

// ✅ Now we know it succeeded
setSuccess("Move revealed! Game resolved.");
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### [F-M-1] Stale Provider/Signer Instances

**Severity:** MEDIUM  
**File:** hooks/useGame.ts  
**Status:** POTENTIAL BUG

**Description:**
Each function creates a new provider/signer instance. If MetaMask state changes between calls, this could cause issues.

**Recommendation:**
Consider caching provider instance or using a provider hook.

---

### [F-M-2] Error Messages Don't Include Transaction Hashes

**Severity:** MEDIUM  
**File:** hooks/useGame.ts  
**Status:** UX ISSUE

**Description:**
When transactions fail, users don't get the transaction hash to investigate on Etherscan.

**Recommendation:**

```typescript
try {
  const tx = await contract.solve(move, salt);
  const receipt = await tx.wait();
  setSuccess(`Success! Transaction: ${tx.hash}`);
} catch (error: any) {
  const txHash = error.transaction?.hash || error.receipt?.hash;
  if (txHash) {
    setError(
      `Transaction failed: ${error.message}. View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}`
    );
  } else {
    setError(`Failed: ${error.message}`);
  }
}
```

---

### [F-M-3] No Nonce Management

**Severity:** MEDIUM  
**File:** hooks/useGame.ts  
**Status:** MISSING FEATURE

**Description:**
If users try to submit multiple transactions quickly, they might have nonce conflicts.

**Recommendation:**
Let ethers.js handle this by default (it does), but consider adding explicit nonce management for advanced users.

---

## 🔵 LOW SEVERITY ISSUES

### [F-L-1] Hardcoded Timeout Display

**File:** hooks/useGame.ts (line 596)

The timeout is hardcoded as 5 minutes in the display, but it should be read from the contract.

### [F-L-2] No Loading State Differentiation

Different operations (deploying, waiting, signing) all show the same "Processing transaction..." message.

### [F-L-3] BigInt Comparison Using ==

**File:** hooks/useGame.ts (line 578)

```typescript
if (c2 == 0) {
  // ❌ Should use === or explicit BigInt comparison
  status = "Waiting for Player 2 to play";
}
```

---

## Summary of Frontend Issues

### Critical: 2

1. Race condition in state reads (TOCTOU)
2. Salt precision/format issues

### High: 7

1. No balance validation before transactions
2. Redundant commitment verification
3. No pending transaction recovery
4. No gas estimation
5. Network change not handled during transactions
6. Insecure localStorage salt storage
7. No transaction receipt validation

### Medium: 3

1. Stale provider instances
2. No transaction hashes in errors
3. No nonce management

### Low: 3

1. Hardcoded timeout display
2. Generic loading messages
3. Loose equality comparisons

---

## Recommended Fixes Priority

### Immediate (Must Fix):

1. ✅ Validate ETH balance before transactions
2. ✅ Check transaction receipt status
3. ✅ Add pending transaction recovery
4. ✅ Remove TOCTOU checks (let contract validate)
5. ✅ Fix salt format handling

### Short Term (Should Fix):

6. ✅ Add gas estimation
7. ✅ Network validation before each transaction
8. ✅ Better error messages with transaction hashes
9. ✅ Encrypt salt in localStorage or warn users strongly

### Long Term (Nice to Have):

10. ✅ Better loading state granularity
11. ✅ Provider caching
12. ✅ Advanced nonce management
