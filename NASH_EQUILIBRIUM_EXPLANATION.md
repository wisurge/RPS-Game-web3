# Mixed Strategy Nash Equilibrium - RPSLS

**Submitted as part of the RPSLS dApp Exercise**

---

## 🎯 Question

**What is the Mixed Strategy Nash Equilibrium of this game (Rock-Paper-Scissors-Lizard-Spock)?**

---

## ✅ Answer

**The Mixed Strategy Nash Equilibrium is for each player to play each of the 5 moves with equal probability of 20% (1/5).**

Specifically:

- **Rock: 20%** (1/5)
- **Paper: 20%** (1/5)
- **Scissors: 20%** (1/5)
- **Spock: 20%** (1/5)
- **Lizard: 20%** (1/5)

---

## 📊 Mathematical Proof

### Game Structure

Rock-Paper-Scissors-Lizard-Spock is a **symmetric zero-sum game** where:

- Each move beats **exactly 2 other moves**
- Each move loses to **exactly 2 other moves**
- Each move ties with **itself**

### Win Matrix

| Player 1 ↓ \ Player 2 → | Rock | Paper | Scissors | Spock | Lizard |
| ----------------------- | ---- | ----- | -------- | ----- | ------ |
| **Rock**                | 0    | -1    | +1       | -1    | +1     |
| **Paper**               | +1   | 0     | -1       | +1    | -1     |
| **Scissors**            | -1   | +1    | 0        | -1    | +1     |
| **Spock**               | +1   | -1    | +1       | 0     | -1     |
| **Lizard**              | -1   | +1    | -1       | +1    | 0      |

Where:

- +1 = Player 1 wins
- -1 = Player 1 loses (Player 2 wins)
- 0 = Tie

### Proof of Equilibrium

Let's prove that the uniform distribution (20% each) is a Nash Equilibrium:

**Assumption:** Player 2 plays the uniform mixed strategy (20% each move).

**Question:** What is Player 1's optimal response?

**Analysis:**

For any move \(M_i\) that Player 1 chooses:

\[
E[\text{Payoff}_{M_i}] = P(\text{Win}) \times (+1) + P(\text{Tie}) \times 0 + P(\text{Lose}) \times (-1)
\]

Since Player 2 plays uniformly (20% each):

- \(P(\text{Win}) = 2 \times 0.2 = 0.4\) (beats 2 moves)
- \(P(\text{Tie}) = 1 \times 0.2 = 0.2\) (ties with 1 move)
- \(P(\text{Lose}) = 2 \times 0.2 = 0.4\) (loses to 2 moves)

Therefore:
\[
E[\text{Payoff}] = 0.4 \times 1 + 0.2 \times 0 + 0.4 \times (-1) = 0.4 - 0.4 = 0
\]

**Key Insight:** The expected payoff is **0 for every move**.

This means:

1. Player 1 has **no incentive to deviate** from the uniform strategy
2. No single move provides an advantage
3. Any mixed strategy Player 1 uses will have expected payoff of 0

By **symmetry**, the same holds for Player 2.

**Conclusion:** The uniform distribution (20% each) is a Nash Equilibrium because:

- Neither player can improve their expected payoff by changing strategy
- Expected payoff is 0 for both players
- No move is "better" than any other

---

## 🔄 Comparison to Classic RPS

### Classic Rock-Paper-Scissors (3 moves):

**Nash Equilibrium:**

- Rock: 33.33% (1/3)
- Paper: 33.33% (1/3)
- Scissors: 33.33% (1/3)

**Expected Payoff:** 0

### RPSLS (5 moves):

**Nash Equilibrium:**

- Rock: 20% (1/5)
- Paper: 20% (1/5)
- Scissors: 20% (1/5)
- Spock: 20% (1/5)
- Lizard: 20% (1/5)

**Expected Payoff:** 0

### Why the Pattern?

Both games share the same structure:

- **Symmetric:** All moves are equivalent in strength
- **Balanced:** Each move beats and loses to the same number of other moves
- **Zero-Sum:** One player's gain is another's loss

In general, for a symmetric game with **n** moves where each beats **n/2** others:

- **Nash Equilibrium:** Play each move with probability **1/n**
- **Expected Payoff:** 0

---

## 🎲 Intuitive Explanation

### Why 20% Each?

1. **If you play Rock more than 20%:**

   - Opponent notices the pattern
   - Opponent plays Paper more often
   - You lose more than you win
   - **Not optimal!**

2. **If you play Rock less than 20%:**

   - You're playing other moves more
   - Opponent adjusts to beat those moves
   - You don't maximize your chances
   - **Not optimal!**

3. **If you play each move exactly 20%:**
   - Opponent **cannot exploit** any pattern
   - No matter what they play, your expected payoff is 0
   - This is the **best you can do** in a fair game
   - **Optimal!**

### Real-World Implications

In practice, this means:

- **Don't be predictable** - randomize your moves
- **Don't favor certain moves** - humans tend to favor Rock
- **Use true randomness** - don't rely on "gut feeling"
- **Accept 50/50 odds** - in a fair game, no strategy guarantees winning

---

## 📈 Game Theory Concepts

### Mixed Strategy

A **mixed strategy** is when a player randomizes between multiple actions rather than always choosing the same action (pure strategy).

### Nash Equilibrium

A **Nash Equilibrium** is a strategy profile where no player can improve their payoff by unilaterally changing their strategy.

In RPSLS:

- If both players use (20%, 20%, 20%, 20%, 20%)
- Neither can improve by deviating
- This is a **Nash Equilibrium**

### Why This Matters for the dApp

The commitment scheme in the smart contract **enforces honest play**:

- Player 1 must commit before seeing Player 2's move
- Player 2 plays without seeing Player 1's move
- Neither can gain advantage through timing
- The Nash Equilibrium strategy is the **optimal approach**

---

## 🔍 Mathematical Details

### Formal Definition

Let:

- \(S = \{\text{Rock, Paper, Scissors, Spock, Lizard}\}\) be the set of pure strategies
- \(p_i\) = probability of playing move \(i\)
- \(u(M_i, M_j)\) = payoff when Player 1 plays \(M_i\) and Player 2 plays \(M_j\)

The uniform mixed strategy is:
\[
\sigma^\* = (1/5, 1/5, 1/5, 1/5, 1/5)
\]

Expected payoff for Player 1 when both play \(\sigma^\*\):
\[
E[u] = \sum*{i=1}^{5} \sum*{j=1}^{5} p_i \cdot p_j \cdot u(M_i, M_j)
\]

\[
E[u] = \sum\_{i=1}^{5} \frac{1}{5} \cdot \frac{1}{5} \cdot \left( 2 \times 1 + 1 \times 0 + 2 \times (-1) \right)
\]

\[
E[u] = \frac{1}{25} \times 5 \times (2 - 2) = 0
\]

### Best Response

For any strategy \(\sigma'\) that Player 2 might play, Player 1's best response when Player 2 plays uniformly is:

\[
BR(\sigma^_) = \sigma^_
\]

The uniform strategy is its **own best response**, confirming it's a Nash Equilibrium.

---

## 🎯 Practical Example

### Scenario: 100 Games

If both players use Nash Equilibrium strategy:

**Player 1's Results (Expected):**

- Win: ~40 games (40%)
- Tie: ~20 games (20%)
- Lose: ~40 games (40%)

**Net Result:** Break even (40 wins - 40 losses = 0)

### Scenario: Player 1 Deviates

**Player 1 plays Rock 50%, others 12.5% each:**

- Player 2 notices and plays Paper 30%
- Player 1 now loses more than wins
- **Exploitable!**

**Player 1 plays uniformly:**

- Player 2 **cannot exploit**
- Expected result remains 0
- **Unexploitable!**

---

## ✅ Conclusion

The Mixed Strategy Nash Equilibrium for Rock-Paper-Scissors-Lizard-Spock is:

**Play each move with equal probability of 20% (1/5).**

This ensures:

1. ✅ No move provides an advantage
2. ✅ Opponent cannot exploit your strategy
3. ✅ Expected payoff is 0 (fair game)
4. ✅ No incentive to deviate
5. ✅ Optimal strategy for both players

---

## 📚 References

- **Game Theory:** "Games of Strategy" by Avinash Dixit and Barry Nalebuff
- **Nash Equilibrium:** John Nash (1950) - "Equilibrium Points in N-Person Games"
- **RPSLS Game:** Created by Sam Kass and Karen Bryla
- **Wikipedia:** https://en.wikipedia.org/wiki/Rock_paper_scissors#Rock_paper_scissors_Spock_lizard

---

**Prepared for:** Kleros Coding Exercise  
**Date:** October 15, 2025  
**Author:** AI Analysis
