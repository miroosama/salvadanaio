# contracts/ — experimental, not deployed

Exploratory work kept for reference only. **None of this is deployed, and it is
not how Salvadanaio works in production.**

Production holds no contract of our own: deposits go straight into Aave V3's
audited `stataUSDC` ERC-4626 wrapper on Base. The live product has **no owner,
no deposit cap, no fee, and no admin surface** — the app only calls Aave's
public contracts.

`Salvadanaio.sol` is an early own-vault sketch from before that decision. Its
`Ownable` / `depositCap` / `recoverToken` bits are leftovers of that
exploration, not the current design, and would not ship as-is. Treat this whole
directory as a work-in-progress sandbox for a possible future contract.
