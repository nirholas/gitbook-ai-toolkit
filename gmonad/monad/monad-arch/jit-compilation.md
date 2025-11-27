# JIT Compilation

> Source: https://docs.monad.xyz/monad-arch/execution/native-compilation

## Documentation

On this page

Summary​
Executing each EVM contract call to completion as quickly as possible is a key part of Monad’s overall performance. To do this, Monad uses both a highly optimized interpreter and a bespoke native-code compiler. The compiler analyzes frequently used contracts once and caches native code so subsequent calls execute more efficiently while preserving exact EVM semantics (including gas and error behavior).
Interpreting vs. Compiling​
Most Ethereum clients execute smart contract code one instruction at a time, checking stack bounds and available gas before applying the instruction’s semantics. This is an interpreter. Interpreters are straightforward to build and maintain, have low startup latency, and can perform very well when implemented with modern techniques.
An alternative is to compile programs. Before execution begins, code is analyzed and transformed into a representation that executes more efficiently. Compilation adds upfront latency and complexity, but it happens once per contract version. If repeated executions are faster, overall system performance improves.
For simplicity and portability, many compilers target a higher-level intermediate representation (e.g., LLVM IR or Cranelift). Because the Monad client targets a specific hardware configuration, the compiler emits native x86-64 directly to maximize control and performance while still matching EVM behavior exactly.
Eliminating Redundant Work​
Compilation lets us precompute behavior ahead of time. Consider this straight-line fragment:
JUMPDESTPUSH1 0x1ADDPUSH0JUMP
Once execution reaches the JUMPDEST, it must proceed through PUSH1, ADD, PUSH0 and JUMP. A pure interpreter would charge gas and perform checks for each instruction as it executes. A compiler can recognize the straight-line block and perform a single upfront gas check for the combined cost of the block (subject to EVM rules), then emit code that runs the block without per-instruction bookkeeping. The result is fewer CPU instructions while preserving identical gas accounting and out-of-gas semantics.
Constant folding is another example. Given:
PUSH1 0x2PUSH1 0x3ADD
the compiler can determine the stack state at ADD and fold it to:
PUSH1 0x5
internally, while still charging the same total gas as the original sequence and maintaining 256-bit modular arithmetic semantics.
Optimizing Code​
Beyond removing redundant work, the compiler chooses efficient implementations based on where operands reside. It maintains a simulated EVM stack that maps each 256-bit stack word to a location on the machine: main memory, a set of general-purpose integer registers, or a single AVX vector register. This approach is a combination of register allocation in a traditional optimizing compiler and stack caching techniques for compiling stack-based languages.
Each EVM instruction is then specialized to the operand locations it sees. For example, AND can be implemented with a single x86 vpand when both arguments are already in AVX registers. Much of the compiler’s effectiveness comes from emitting specialized sequences for common operand-location combinations.
Compilation Performance​
Compiling every contract ahead of time is impractical. Instead, the compiler tracks contracts by cumulative gas consumed over all executions and caches native code for the “hottest” ones. As blocks execute, newly hot contracts enter a compile queue. Compilation runs asynchronously, and contracts that are not yet compiled (or never become hot) continue to run on the highly optimized interpreter. The cache ensures repeated calls to popular contracts benefit from compilation without blocking execution on compile latency.

## Code Examples

```prism
JUMPDESTPUSH1 0x1ADDPUSH0JUMP
```

```prism
PUSH1 0x2PUSH1 0x3ADD
```

```prism
PUSH1 0x5
```

