# Running the example program on snapshot data

> Source: https://docs.monad.xyz/execution-events/getting-started/snapshot

## Documentation

On this page

The easiest way to get acquainted with the execution event system is to
try out the example program and read the code, although you may want to
read the quick overview explaining
the basic concepts first.
If you're following this guide in order you should have already built one
of the example programs. If you have not built one yet, choose the
appropriate guide for your language or choice (either
C or
Rust), and then return to this page.
Live event rings vs. snapshot event rings​
The event ring's shared memory data structures typically live inside of a
regular file. Any process that wants shared access to an event ring, first
locates it via the filesystem, then maps a shared view of it into the
process' virtual memory map using the
mmap(2) system call.
Event ring files come in two flavors:


"Live" event ring files -- these are the "normal" event ring files that
are the source of real-time data. The whole point of the SDK is to read
real-time events from these files, but they're not very convenient for most
day-to-day software development tasks. Suppose, for example, you wanted to
write a test for your data processing program. The SDK is mostly designed
around reading events, so to test it with a live event ring, you'd need
to write some dummy event publishing code just to have events to read. For
execution events, the live event ring file is populated by the execution
daemon, which we have not even installed at this point in the tutorial!
A lot of development headaches are solved by the second kind of event ring
file.


"Snapshot" event ring files -- these are compressed snapshots taken of a
live event ring file as it existed at a particular moment in time. Typically
they are "rewound" to the oldest event in the circular event queue, and are
used to replay a fixed set of historical execution events. Snapshot files are
useful for testing and development workflows, because you do not need to be
running an active publisher to use them. Because they're so useful for
development, snapshots are the first data source we'll use, before trying the
example program on a live node.


Running the example program on a snapshot file​
Step 1: download a snapshot file​
Run this command to download a snapshot:
$ curl https://raw.githubusercontent.com/category-labs/monad-bft/refs/tags/release/exec-events-sdk-v1.0/monad-exec-events/test/data/exec-events-emn-30b-15m/snapshot.zst > /tmp/exec-events-emn-30b-15m.zst
The emn-30b-15m part of the filename means "Ethereum mainnet replay for 30
blocks starting after block 15 million". In other words, this contains the
execution events emitted during a historical replay of the Ethereum blockchain
(chain ID 1), from block 15,000,001 to block 15,000,031.
The Category Labs execution daemon is able to execute blocks from Monad
blockchains (the EVM chain ID 143 or any of its test networks), but also from
other EVM-compatible networks. Historical replay of the Ethereum mainnet is
used as an execution "conformance test", to make sure the node software remains
as Ethereum compatible as possible.
We use an Ethereum chain snapshot in the tutorial under the assumption that
many developers are already familiar with the Ethereum ecosystem, but might be
new to Monad. You can check that all of the data captured in the snapshot file
matches the data published by your favorite Ethereum data provider. For example,
you'll be able to check that the data shown here matches what is reported by
websites like Etherscan.
Why /tmp?Our example curl command placed the snapshot file in /tmp for a reason.
Although the file can be placed anywhere, we encourage users not to place it
in the same directory they are already in, to ensure they won't encounter a
confusing error the first time they run the program.If the file is placed in the current working directory, and you specified it as
exec-events-emn-30b-15m.zst, an error would occur. That error would go away
if you instead referred to the file as ./exec-events-emn-30b-15m.zst. The
leading ./ "fixes" the problem in a way you've seen before: when you want to
run a command in your UNIX shell which is not on the $PATH, you often add a
./ to suppress the default automatic path search. Any / character marks the
input as an actual file path and not a "command name" to be searched for.A similar thing happens with event ring files, where file inputs without / are
translated in an automatic way. The file would not be "searched for" in the
current directory unless the name contains a ./ to communicate that the input
is a path. "Pure" filenames are only searched for in a special directory called
the "default event ring directory." The rationale is explained fully in the
"Location of event ring files"
section of the SDK.
Step 2: run the SDK example program you built previously​
The command is slightly different for each programming language.
For C, run:
$ eventwatch /tmp/exec-events-emn-30b-15m.zst
For Rust, run:
cargo run -- --event-ring-path /tmp/exec-events-emn-30b-15m.zst -d
The Rust example program output is more informative than the C output. Both
programs "pretty-print" the event descriptor information, but the C example
program can only hexdump the event payloads, whereas the Rust program is able
to debug-print them, thanks to Rust's #[derive(Debug)] feature. The -d
parameter in the Rust command line tells the program to print this "debug"
form.
noteFull pretty-printers do exist in the SDK for the C language family, but they
are only available for C++ and are based on the standard C++ <format> library
Step 3: analyze the data (Rust only)​
If you're running the Rust example program -- and this step of the guide
assumes you are -- you will see a text dump of all event data. We'll look
at a few specific events to give you a sense of what kind of data the SDK
produces, and what you can do with it.
The first two lines printed by the Rust example program look like this:
16:26:14.354056730 BLOCK_START [2 0x2] SEQ: 1 BLK: 15000001Payload: BlockStart(monad_exec_block_start { <block-start-details> })
Let's break down the first line:


16:26:14.354056730 -- this is the nanosecond-resolution timestamp when the
original event was recorded; since we're looking at a snapshot and not live
data, this will always be the same number, and it's from a long time ago; the
actual "date" portion of the timestamp is omitted when we print it, since the
typical use-case for the SDK is for real-time data (where the date is usually
"today")


BLOCK_START - this is the type of the event that occurred inside of the
EVM; a BLOCK_START event is recorded when a new block is first seen by
the execution daemon, and its payload describes all the execution inputs
that are known at the start of execution processing; this mostly corresponds
to the fields in the Ethereum block header which are known prior to execution


[2 0x2] - this is the numerical code that corresponds to the BLOCK_START
event type, in both decimal and hexidecimal


SEQ: 1 - the sequence number (a monotonic counter of the number of
events published so far) is 1; in a live event ring, these are used
for gap / overwrite detection


BLK: 15000001 - this event is part of block number 15,000,001


The second line is produced by this Rust statement:
println!("Payload: {exec_event:x?}");
Because it's a very long line (there is no line-wrapping in Rust's
#[derive(Debug)] output) it was abbreviated in our example output text. We'll
look at parts of it in a moment, but we'll pause here to explain some things
about this println!("Payload: {exec_event:x?}") statement.
exec_event is a value of Rust enum type ExecEvent. Here is how that
enum is defined:
pub enum ExecEvent {    RecordError(monad_event_record_error),    BlockStart(monad_exec_block_start),    BlockReject(monad_exec_block_reject),    BlockPerfEvmEnter,    BlockPerfEvmExit,    BlockEnd(monad_exec_block_end),    BlockQC(monad_exec_block_qc),    BlockFinalized(monad_exec_block_finalized),    BlockVerified(monad_exec_block_verified),    TxnHeaderStart {        txn_index: usize,        txn_header_start: monad_exec_txn_header_start,        data_bytes: Box<[u8]>,        blob_bytes: Box<[u8]>,    },    // ... more enum variants follow, full definition not shown}


The debug output starts with BlockStart(...), so exec_event has the
ExecEvent::BlockStart enum variant


It seems like we already knew that from the earlier BLOCK_START [2 0x2]
print-out, but there's a subtle difference. The first line prints information
found in the event descriptor, which is like a header containing the the
common fields of an event. At the point in the program where the descriptor
line is printed, it has not yet decoded the event payload to construct the
exec_event variant. Suppose we were only interested in block 15,000,002.
In that case, we could look at just the descriptor, notice it relates to
block 15,000,001, and skip over this event (and all other events for that
block), i.e., we would not bother decoding it


The value associated with an ExecEvent::BlockStart variant if of type
struct monad_exec_block_start; notice that this type does not follow the
normal Rust code-formatting style: it uses lower_case_snake_case instead of
UpperCamelCase and has a seemingly-unnecessary prefix (all the variant
value types start with monad_exec_). This is because the payload types
are defined as C language structures, and their Rust equivalents are
generated using bindgen. The C-style spelling helps indicate that. The
definition of monad_exec_block_start comes from the C header file
exec_event_ctypes.h, where it is defined like this:


/// Event recorded at the start of EVM executionstruct monad_exec_block_start{    struct monad_exec_block_tag block_tag;          ///< Proposal is for this block    uint64_t round;                                 ///< Round when block was proposed    uint64_t epoch;                                 ///< Epoch when block was proposed    __uint128_t proposal_epoch_nanos;               ///< UNIX epoch nanosecond timestamp    monad_c_uint256_ne chain_id;                    ///< Blockchain we're associated with    struct monad_c_secp256k1_pubkey author;         ///< Public key of block author    monad_c_bytes32 parent_eth_hash;                ///< Hash of Ethereum parent block    struct monad_c_eth_block_input eth_block_input; ///< Ethereum execution inputs    struct monad_c_native_block_input monad_block_input; ///< Monad execution inputs};
The Ethereum execution inputs field eth_block_input is the field that
corresponds to the parts of the Ethereum block header which are known at
the start of execution.
Some of this output is difficult to read, since Rust's #[derive(Debug)] is
meant for ease of debugging and doesn't always "pretty-print" data in the best
way for readability. Other fields are clear though, for example, the gas_limit
of the block is shown as a hexidecimal value:
monad_c_eth_block_input { <not shown...> gas_limit: 1c9c380 <...not shown> }
0x1c9c380 corresponds to the decimal number 30,000,000, a number we expect
to see for a mainnet Ethereum gas limit.
infoReal pretty-printing of events is done with a developer tool called eventcap,
which is part of the SDK. This example is meant to be as simple and short as
possible, to help with learning the API. When debugging real event programs,
you will probably prefer developer tools like eventcap. The build instructions
for it are in the final step of the "Getting start" guide
(here).
Now let's look for something a little more interesting, to get a sense of a
what a real SDK consumer might do with this data.
If you search the output for the string TXN_EVM_OUTPUT, the first match
will be this event (with some formatting differences):
16:26:14.376725676 TXN_EVM_OUTPUT [17 0x11] SEQ: 236 BLK: 15000001 TXN: 0Payload: TxnEvmOutput { txn_index: 0, output: monad_exec_txn_evm_output {    receipt: monad_c_eth_txn_receipt { status: false, log_count: 0, gas_used: 765c },    call_frame_count: 1} }
This is the first event that describes the output of transaction zero in block
15,000,001 -- note the TXN: 0 in the descriptor and txn_index: 0 in the
payload. We say "first event" because the output for any particular transaction
usually spans several events: each log, call frame, state change, and state
access is recorded as a separate event.
The first event is always of type TXN_EVM_OUTPUT. It contains a basic summary
of what happened, and an indication of how many more output-related events will
follow. You can see that this particular transaction emitted zero logs, and one
call frame trace. The call frame information is recorded in the next event,
on the line below this one.
As it turns out, the very first transaction is also somewhat interesting: it
failed to execute after using 30,300 gas (0x765c). The transaction's failure is
recorded by status field. As you can see, it is set to false.
Why did it fail? To figure it out, we'll use the information in the
TXN_CALL_FRAME event that follows this one. The evmc_status_code field in
that event has the value 2, which is the numeric value of the
EVMC_REVERT
status code. This tells us that the revert was requested by the contract code
itself, i.e., it executed a
REVERT instruction. In other words,
this was not a VM-initiated exceptional halt such as "out of gas" or "illegal
instruction, but something the contract itself decided to do.
Because this is a Solidity contract, we can decode richer error information
from the call frame. The REVERT instruction can pass arbitrary-length return
data back to the caller. This return data is recorded in the call frame, in the
return_bytes array.
Observe that the first 4 bytes of return_bytes are 0x8c379a0. This is how
Solidity represents a revert that carries a string explanation. The details of
how this string is encoded is
here,
but the upshot is that we can decode the last 32 bytes of this return_bytes
array as an ASCII string. If you try this yourself, you'll discover that it
says:
Ownable: caller is not the owner
This error string ultimately comes from
here,
in OpenZeppelin's abstract "Ownable" contract. This was used as a third-party
library in the implementation of this smart contract, to provide some simple
access controls.
In an earlier event (called TXN_HEADER_START) we can find the transaction's
Keccak hash, which is
0xaedb8ef26125d8ad6e0c5f19fc9cbdd7f4a42eb82de88686b39090b8abcfeb8f. If
we look up information about this transaction on
Etherscan,
using the hash, we can see that Etherscan agrees. The Status: field reads:
Fail with error 'Ownable: caller is not the owner'
Feel free to double-check this result using your favorite tool for exploring
Ethereum mainnet data!
Step 4: Learn how it works​
The source code for the example program you just ran has a lot of comments,
and it is designed to teach you how to use the API. The best way to learn about
the SDK is to read through it, but if you haven't read the
overview yet, you may want to do that first.
You can either do that now, or continue on to the next step, where we'll
install our own local Monad node. Once we have our own
node, we can run this same example program but make it consume real-time
Monad blockchain data instead of snapshot data.

## Code Examples

```prism
$ curl https://raw.githubusercontent.com/category-labs/monad-bft/refs/tags/release/exec-events-sdk-v1.0/monad-exec-events/test/data/exec-events-emn-30b-15m/snapshot.zst > /tmp/exec-events-emn-30b-15m.zst
```

```prism
$ eventwatch /tmp/exec-events-emn-30b-15m.zst
```

```prism
cargo run -- --event-ring-path /tmp/exec-events-emn-30b-15m.zst -d
```

```prism
16:26:14.354056730 BLOCK_START [2 0x2] SEQ: 1 BLK: 15000001Payload: BlockStart(monad_exec_block_start { <block-start-details> })
```

```prism
println!("Payload: {exec_event:x?}");
```

```prism
pub enum ExecEvent {    RecordError(monad_event_record_error),    BlockStart(monad_exec_block_start),    BlockReject(monad_exec_block_reject),    BlockPerfEvmEnter,    BlockPerfEvmExit,    BlockEnd(monad_exec_block_end),    BlockQC(monad_exec_block_qc),    BlockFinalized(monad_exec_block_finalized),    BlockVerified(monad_exec_block_verified),    TxnHeaderStart {        txn_index: usize,        txn_header_start: monad_exec_txn_header_start,        data_bytes: Box<[u8]>,        blob_bytes: Box<[u8]>,    },    // ... more enum variants follow, full definition not shown}
```

```prism
/// Event recorded at the start of EVM executionstruct monad_exec_block_start{    struct monad_exec_block_tag block_tag;          ///< Proposal is for this block    uint64_t round;                                 ///< Round when block was proposed    uint64_t epoch;                                 ///< Epoch when block was proposed    __uint128_t proposal_epoch_nanos;               ///< UNIX epoch nanosecond timestamp    monad_c_uint256_ne chain_id;                    ///< Blockchain we're associated with    struct monad_c_secp256k1_pubkey author;         ///< Public key of block author    monad_c_bytes32 parent_eth_hash;                ///< Hash of Ethereum parent block    struct monad_c_eth_block_input eth_block_input; ///< Ethereum execution inputs    struct monad_c_native_block_input monad_block_input; ///< Monad execution inputs};
```

```prism
monad_c_eth_block_input { <not shown...> gas_limit: 1c9c380 <...not shown> }
```

```prism
16:26:14.376725676 TXN_EVM_OUTPUT [17 0x11] SEQ: 236 BLK: 15000001 TXN: 0Payload: TxnEvmOutput { txn_index: 0, output: monad_exec_txn_evm_output {    receipt: monad_c_eth_txn_receipt { status: false, log_count: 0, gas_used: 765c },    call_frame_count: 1} }
```

```prism
Ownable: caller is not the owner
```

```prism
Fail with error 'Ownable: caller is not the owner'
```

