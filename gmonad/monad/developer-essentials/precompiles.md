# Precompiles

> Source: https://docs.monad.xyz/developer-essentials/precompiles

## Documentation

All Ethereum precompiles as of the Pectra fork (0x01 to 0x11), plus precompile 0x0100
(RIP-7212;
signature verification of secp256r1 aka P256), are supported.
Some external references are helpful:

For 0x01 to 0x0a, see evm.codes
For 0x0b to 0x11 (BLS12-381 utilities), see EIP-2537
For 0x0100 (secp256r1/P256 signature verification), see RIP-7212

AddressNameGasNotes0x01ecRecover6000ECDSA public key recovery function0x02sha25660 + 12 * word_sizehash function0x03ripemd160600 + 120 * word_sizehash function0x04identity15 + 3 * word_sizereturns the input0x05modexpsee gas detailarbitrary-precision exponentiation under modular arithmetic0x06ecAdd300point addition (ADD) on the elliptic curve alt_bn1280x07ecMul30,000scalar multiplication (MUL) on the elliptic curve alt_bn1280x08ecPairing225,000bilinear function on groups on the elliptic curve alt_bn1280x09blake2frounds * 2compression function F used in the BLAKE2 cryptographic hashing algorithm0x0apoint_eval200,000verify KZG commitments (see description in EIP-4844)0x0bbls12_g1_add375point addition in G1 (curve over base prime field). See EIP-25370x0cbls12_g1_msmsee EIP-2537multi-scalar-multiplication (MSM) in G10x0dbls12_g2_add600point addition in G2 (curve over quadratic extension of the base prime field)0x0ebls12_g2_msmsee EIP-2537MSM in G20x0fbls12_pairing_checksee EIP-2537pairing operation between a set of pairs of (G1, G2) points0x10bls12_map_fp_to_g15500maps base field element into the G1 point0x11bls12_map_fp2_to_g223800maps extension field element into the G2 point0x0100p256_verify6900signature verification of the secp256r1 (aka P256) elliptic curve. See RIP-72120x1000stakingvaries by function callstaking precompile. See staking
Note that a few precompiles (namely 0x01, 0x06, 0x07, 0x08, 0x09, and 0x0a) have been
repriced relative to Ethereum, as discussed here.
See also the source code.

