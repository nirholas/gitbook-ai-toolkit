# Execution events overview

> Source: https://docs.monad.xyz/execution-events/overview

## Documentation

On this page

The execution daemon includes a system for recording events that occur during
transaction processing. An "execution event" is a notification that the EVM has
performed some action, such as "an account balance has been updated" or "a new
block has started executing." These EVM events can be observed by external
third-party applications, using a high-performance inter-process communication
(IPC) channel.
The execution daemon publishes event data to shared memory, and external
applications read from this same shared memory region to observe the events.
Your application can read events using the C library libmonad_event or the
Rust package monad-exec-events.
This page provides an overview of the basic concepts used in both the C
and Rust APIs.
Event rings vs. execution events​
Although the real-time data system and its SDK are often called "execution
events," there are two different parts of the SDK:


Event ring API - "event ring" is the name of a shared memory data
structure and the API for reading and writing to it. Event rings are a
general purpose, IPC broadcast utility for publishing events to any number
of reading processes. The event ring API works with unstructured I/O: like
the UNIX
read(2)
and
write(2)
file I/O system calls, the event ring API sees all data as raw byte arrays


Execution event definitions - the actual "execution events" are the
standardized binary formats that the execution daemons writes to represent
particular EVM actions. It can be thought of as a protocol, a schema, or a
serialization format. Continuing the analogy, if the event ring API is like
the UNIX read(2) and write(2) file APIs, then "execution events" are
like a "file format" that defines what a particular file contains


In the Rust SDK, these two parts are in different packages: monad-event-ring
and monad-exec-events.
The C SDK is a single library, but the header files for the two different
parts live in different directories: the event ring headers live in the
category/core/event subdirectory, and the execution event files live in
category/execution/ethereum.
Event ring basics​
What is an event?​
Events are made up of two components:

The event descriptor is a fixed-size (currently 64 byte) object describing
the common fields of an event that has happened. It contains the event's
type, a sequence number, a timestamp, and some internal book-keeping
information
The event payload is a variably-sized piece of extra data about the event,
which is specific to the event type. For example, a "transaction log" event
describes a single EVM log record emitted by a transaction. While the
descriptor tells us the event's type (i.e., that it is "log event"), the
payload tells us all the details: the contract address, the log topics, and
the log data. Some of the fields in the event descriptor not already
mentioned are used to communicate where in shared memory the payload bytes
are located, and the payload's length

noteRemember that at the event ring API level, an event payload is just an
unstructured byte buffer; the reader must know the format of what they are
reading, and interpret it accordingly
Where do events live?​
When an event occurs, an event descriptor is written into a ring buffer that
lives in a shared memory segment. This ring buffer is the "event descriptor
array" in the diagram below.
Event payloads are stored in a different array (in a separate shared memory
segment) called the "payload buffer."
  ╔═Event descriptor array══════════════...═════════════════════════════════════╗  ║                                                                             ║  ║ ┌───────────────┐ ┌───────────────┐     ┌───────────────┐ ┌───────────────┐ ║  ║ │     Event     │ │     Event     │     │     Event     │ │░░░░░░░░░░░░░░░│ ║  ║ │  descriptor   │ │  descriptor   │     │  descriptor   │ │░░░░ empty ░░░░│ ║  ║ │       1       │ │       2       │     │       N       │ │░░░░░░░░░░░░░░░│ ║  ║ └┬──────────────┘ └┬──────────────┘     └┬──────────────┘ └───────────────┘ ║  ╚══╬═════════════════╬════════════════...══╬══════════════════════════════════╝     │                 │                     │     │                 │                     │     │         ┌───────┘                     └─┐     │         │                               │     │         │                               │   ╔═╬═════════╬═══════════════════════════...═╬═══════════════════════════════╗   ║ │         │                               │                               ║   ║ ▼───────┐ ▼─────────────────────────┐     ▼─────────────┐ ┌─────────────┐ ║   ║ │Event 1│ │         Event 2         │     │   Event N   │ │░░░░free░░░░░│ ║   ║ │payload│ │         payload         │     │   payload   │ │░░░░space░░░░│ ║   ║ └───────┘ └─────────────────────────┘     └─────────────┘ └─────────────┘ ║   ╚═Payload buffer════════════════════════...═════════════════════════════════╝
Keep in mind that real event payloads are typically much larger (in terms of
number of bytes) than the event descriptors, even though they don't appear that
way in this simple diagram. The diagram is primarily trying to show that:

Event descriptors are fixed-size and event payloads are variably-sized
An event descriptor refers / "points to" the location of its payload
Event descriptors and payloads live in different contiguous arrays of shared
memory

Although there are two different ring buffers in this system -- the descriptor
array and payload byte buffer -- we call the entire combined data structure an
"event ring."
A few properties about the style of communication chosen:


It supports broadcast semantics: multiple readers may read from the event
ring simultaneously, and each reader maintains its own iterator position
within the ring


As in typical broadcast protocols, the writer is not aware of the readers --
events are written regardless of whether anyone is reading them or not.
Because the writer does not even know what the readers are doing, it cannot
wait for a reader if it is slow. Readers must iterate through events quickly,
or events will be lost: descriptor and payload memory can be overwritten by
later events. Conceptually the event sequence is a queue (it has FIFO
semantics) but is it called a ring to emphasize its overwrite-upon-overflow
semantics


A sequence number is included in the event descriptor to detect gaps (missing
events due to slow readers), and a similar strategy is used to detect when
payload buffer contents are overwritten


Execution event basics​
As mentioned, the event ring API works with unstructured I/O. When working
with a particular event ring, the reader assumes it has some known format. For
the remainder of the overview, we'll look at an example execution event.
Example: the "transaction start" event​
One particularly important kind of event is the "start of transaction header"
event, which is recorded shortly after a new transaction is decoded by the EVM.
It contains most of the transaction information (encoded as a C structure) as
its event payload. The payload structure is defined in exec_event_ctypes.h
as:
/// First event recorded when transaction processing startsstruct monad_exec_txn_header_start {    monad_c_bytes32 txn_hash;     ///< Keccak hash of transaction RLP    monad_c_address sender;       ///< Recovered sender address    struct monad_c_eth_txn_header        txn_header;               ///< Transaction header};
The nested monad_c_eth_txn_header structure contains most of the interesting
information -- it is defined in eth_ctypes.h as follows:
/// Fields of an Ethereum transaction that are recognized by the monad EVM/// implementation.////// This type contains the fixed-size fields present in any supported/// transaction type. If a transaction type does not support a particular field,/// it will be zero-initialized.struct monad_c_eth_txn_header {    enum monad_c_transaction_type        txn_type;                        ///< EIP-2718 transaction type    monad_c_uint256_ne chain_id;         ///< T_c: EIP-155 blockchain identifier    uint64_t nonce;                      ///< T_n: num txns sent by this sender    uint64_t gas_limit;                  ///< T_g: max usable gas (upfront xfer)    monad_c_uint256_ne max_fee_per_gas;  ///< T_m in EIP-1559 txns or T_p (gasPrice)    monad_c_uint256_ne        max_priority_fee_per_gas;        ///< T_f in EIP-1559 txns, 0 otherwise    monad_c_uint256_ne value;            ///< T_v: wei xfered or contract endowment    monad_c_address to;                  ///< T_t: recipient    bool is_contract_creation;           ///< True -> interpret T_t == 0 as null    monad_c_uint256_ne r;                ///< T_r: r value of ECDSA signature    monad_c_uint256_ne s;                ///< T_s: s value of ECDSA signature    bool y_parity;                       ///< Signature Y parity (see YP App. F)    monad_c_uint256_ne        max_fee_per_blob_gas;            ///< EIP-4844 contribution to max fee    uint32_t data_length;                ///< Length of trailing `data` array    uint32_t blob_versioned_hash_length; ///< Length of trailing `blob_versioned_hashes` array    uint32_t access_list_count;          ///< # of EIP-2930 AccessList entries    uint32_t auth_list_count;            ///< # of EIP-7702 AuthorizationList entries};
The formal nomenclature in the comments (e.g., T_n and T_c) are references
to variable names in the
Ethereum Yellow Paper.
The type monad_c_uint256_ne ("native endian") is a 256-bit integer that is
stored as a uint64_t[4] in the
limb format
common in most "big integer" libraries that have good performance.
noteIf you are using the Rust SDK, struct types with the same names (and the same
binary layouts, courtesy of a #[repr(C)] attribute) are generated by
bindgen when the monad-exec-events
package is built. The defining characteristic of the execution event payloads
is that they rely on the "natural" interoperability of simple C data
structures.Most popular programming languages have a defined foreign function interface
for working with C code, and this usually also entails some way to "naturally"
work with C structure types. Although C's data representation is not portable,
these objects live in shared memory, therefore both the reader and writer must
be on the same host, and must follow the same C ABI.
Variable-length trailing arrays and subsequent events​
The struct monad_exec_txn_header_start object is not the only piece of data
in the event payload:


The transaction's variably-sized data byte array, whose length is specified
by the data_length field, is also part of the event payload and immediately
follows the struct monad_exec_txn_header_start object


If this is an EIP-4844 transaction, a blob_versioned_hashes array will
immediately follow the data array


Both of these are examples of "variable-length trailing" (VLT) array payload
data; "trailing" means a simple variable-length array is recorded after a
fixed-size payload structure which (among other things) must contain a field
that describes length of the array; if there is more than VLT array, they
are recorded in the same order that their corresponding _length fields are
listed in the fixed-size structure


The EIP-2930 and EIP-7702 lists are also variable-length items in a
transaction, but they are not recorded as in the payload of the "start of
transaction header" event.
Instead of being recording in trailing arrays, a unique event will be recorded
for each EIP-2930 access list entry and each EIP-7702 authorization tuple. The
number of these events is published in the "start of transaction header"
event payload (see the access_list_count and auth_list_count fields), so
that the reader will know how many more events to expect.
Execution event properties in the descriptor​
So far we've talked about the payload for a "start of transaction" event, but
the common properties of the event are recorded directly in the event
descriptor. Most importantly, these include the numeric code that identifies
the type of event, so we know we're supposed to interpret the unstructured
payload bytes as a struct monad_exec_txn_header_start in the first place.
An event descriptor is defined this way:
struct monad_event_descriptor{    alignas(64) uint64_t seqno;  ///< Sequence number, for gap/liveness check    uint16_t event_type;         ///< What kind of event this is    uint16_t : 16;               ///< Unused tail padding    uint32_t payload_size;       ///< Size of event payload    uint64_t record_epoch_nanos; ///< Time event was recorded    uint64_t payload_buf_offset; ///< Unwrapped offset of payload in p. buf    uint64_t content_ext[4];     ///< Extensions for particular content types};
For a "start of transaction header" event, the event_type field will be set
to the value of the C enumeration constant MONAD_EXEC_TXN_HEADER_START, a
value in enum monad_exec_event_type. This tells the user that it is
appropriate to cast the const uint8_t * pointing to the start of the event
payload to a const struct monad_event_txn_header_start *.
All the C enumeration constants start with a MONAD_EXEC_ prefix, but
typically the documentation refers to event types without the prefix, e.g.,
TXN_HEADER_START.
Note that the transaction number is not included in the payload structure.
Because of their importance in the blockchain protocol, transaction numbers
are encoded directly in the event descriptor (this encoding and the rationale
for storing it in the descriptor is described elsewhere in the documentation,
in the section describing
flow tags).
The potential presence of subsequent EIP-2930 and EIP-7702 events is also why
this event is called the start of the transaction header. A corresponding
event called TXN_HEADER_END is emitted after all the transaction header
information has been seen. It has no payload, and only serves to announce
that all events related to the header have been recorded. Such an event is
called a "marker event" in the documentation.
Finally, the reason it is called a "header" in the first place, is that there
are many more events related to transactions. The various "header" just
describe all the inputs that were in the block. Most of the events relate to
transaction outputs: the logs, the call frames, the state changes, and the
receipt.
Example in-memory layout​
The following diagram illustrates everything explained above about a
transaction header's variable-length trailing arrays, related subsequent
events, and its terminating marker event. This example transaction has two
accounts in its EIP-2930 access list, and no EIP-7702 entries. Each address in
an EIP-2930 list records a separate TXN_ACCESS_LIST_ENTRY event, with a
variable-length trailing array of potentially-accessed storage keys.
                                      ╔═Payload buffer══════════════════════════════╗                                      ║                                             ║                                      ║  ┏━━━━━━━TXN_HEADER_START payload━━━━━━━━┓  ║                                      ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║                                  ┌───╬──╋─▶─monad_exec_txn_header_start───────┐░┃  ║                                  │   ║  ┃░│                                   │░┃  ║                                  │   ║  ┃░│ monad_c_bytes32 txn_hash;         │░┃  ║                                  │   ║  ┃░│ monad_c_address sender;           │░┃  ║                                  │   ║  ┃░│ struct monad_c_eth_txn_header     │░┃  ║  ╔═Event descriptor array════╗   │   ║  ┃░│     txn_header;                   │░┃  ║  ║                           ║   │   ║  ┃░├───────────────────────────────────┤░┃  ║  ║ ┌───────────────────────┐ ║   │   ║  ┃░│                                   │░┃  ║  ║ │ seqno: 1              □─╬───┘   ║  ┃░│     Transaction data variable     │░┃  ║  ║ │ TXN_HEADER_START      │ ║       ║  ┃░│       length trailing array       │░┃  ║  ║ └───────────────────────┘ ║       ║  ┃░│                                   │░┃  ║  ║                           ║       ║  ┃░│                                   │░┃  ║  ║ ┌───────────────────────┐ ║       ║  ┃░└───────────────────────────────────┘░┃  ║  ║ │ seqno: 2              □─╬────┐  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║ │ TXN_ACCESS_LIST_ENTRY │ ║    │  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║  ║ └───────────────────────┘ ║    │  ║                                             ║  ║                           ║    │  ║  ┏━━━━━TXN_ACCESS_LIST_ENTRY payload━━━━━┓  ║  ║ ┌───────────────────────┐ ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║ │ seqno: 3              │ ║    └──╬──╋─▶─monad_exec_txn_access_list_entry──┐░┃  ║  ║ │ TXN_ACCESS_LIST_ENTRY □─╬────┐  ║  ┃░│                                   │░┃  ║  ║ └───────────────────────┘ ║    │  ║  ┃░│ uint32_t index;                   │░┃  ║  ║                           ║    │  ║  ┃░│ struct monad_c_access_list_entry  │░┃  ║  ║ ┌───────────────────────┐ ║    │  ║  ┃░│     entry;                        │░┃  ║  ║ │ seqno: 4              │ ║    │  ║  ┃░├───────────────────────────────────┤░┃  ║  ║ │ TXN_HEADER_END        │ ║    │  ║  ┃░│       Storage key variable        │░┃  ║  ║ └───────────────────────┘ ║    │  ║  ┃░│       length trailing array       │░┃  ║  ║                           ║    │  ║  ┃░└───────────────────────────────────┘░┃  ║  ║                           ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║                           ║    │  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║  ║                           ║    │  ║                                             ║  ║                           ║    │  ║  ┏━━━━━TXN_ACCESS_LIST_ENTRY payload━━━━━┓  ║  ║                           ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║                           ║    └──╬──╋─▶─monad_exec_txn_access_list_entry──┐░┃  ║  ║                           ║       ║  ┃░│                                   │░┃  ║  ║                           ║       ║  ┃░│ uint32_t index;                   │░┃  ║  ╚═══════════════════════════╝       ║  ┃░│ struct monad_c_access_list_entry  │░┃  ║                                      ║  ┃░│     entry;                        │░┃  ║                                      ║  ┃░├───────────────────────────────────┤░┃  ║                                      ║  ┃░│                                   │░┃  ║                                      ║  ┃░│       Storage key variable        │░┃  ║                                      ║  ┃░│       length trailing array       │░┃  ║                                      ║  ┃░│      (this has more storage       │░┃  ║                                      ║  ┃░│        keys and is larger)        │░┃  ║                                      ║  ┃░│                                   │░┃  ║                                      ║  ┃░└───────────────────────────────────┘░┃  ║                                      ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║                                      ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║                                      ║                                             ║                                      .                                             .                                      .                                             .                                      .                                             .                                      ║                                             ║                                      ╚═════════════════════════════════════════════╝
Patterns in execution event serialization​
Why are EIP-2930 entries recorded as separate events instead of as
variable-length trailing arrays? Because there are two levels of
variable-length information involved. There are a variable number of EIP-2930
accounts, and then for each account, a variable-length number of associated
storage keys.
The event serialization protocol tries to be very simple: the only time a
variable length trailing array will be recorded is when the array element
type is fixed size. If there are multiple dimensions to the variability, they
are "factored out" by using more distinct events. The trade-off is between
fewer events with a more complex encoding, v.s. more events which "unfold" the
data into a "flatter" shape.
Technically, the EIP-7702 authorization list could be represented as a
variable-length trailing array, since the authorization tuples are fixed-size.
However, as a design decision, variable-length trailing arrays are only allowed
to have simple element types like u8 or uint256, and there cannot be too
many of them.
The decoding logic of VLT arrays tends to be error prone; it looks confusing
because it is harder to "see" in the code exactly what the serialization rules
are. "Unfolding" the data into more events is more self-documenting: distinct
typed objects are created rather than relying on implicit parsing rules for
reinterpreting unstructured trailing data.
Consequently, VLT arrays are only used when their use seems "obvious", e.g.,
the storage key arrays in each EIP-2930 access list entry.

## Code Examples

```prism
╔═Event descriptor array══════════════...═════════════════════════════════════╗  ║                                                                             ║  ║ ┌───────────────┐ ┌───────────────┐     ┌───────────────┐ ┌───────────────┐ ║  ║ │     Event     │ │     Event     │     │     Event     │ │░░░░░░░░░░░░░░░│ ║  ║ │  descriptor   │ │  descriptor   │     │  descriptor   │ │░░░░ empty ░░░░│ ║  ║ │       1       │ │       2       │     │       N       │ │░░░░░░░░░░░░░░░│ ║  ║ └┬──────────────┘ └┬──────────────┘     └┬──────────────┘ └───────────────┘ ║  ╚══╬═════════════════╬════════════════...══╬══════════════════════════════════╝     │                 │                     │     │                 │                     │     │         ┌───────┘                     └─┐     │         │                               │     │         │                               │   ╔═╬═════════╬═══════════════════════════...═╬═══════════════════════════════╗   ║ │         │                               │                               ║   ║ ▼───────┐ ▼─────────────────────────┐     ▼─────────────┐ ┌─────────────┐ ║   ║ │Event 1│ │         Event 2         │     │   Event N   │ │░░░░free░░░░░│ ║   ║ │payload│ │         payload         │     │   payload   │ │░░░░space░░░░│ ║   ║ └───────┘ └─────────────────────────┘     └─────────────┘ └─────────────┘ ║   ╚═Payload buffer════════════════════════...═════════════════════════════════╝
```

```prism
/// First event recorded when transaction processing startsstruct monad_exec_txn_header_start {    monad_c_bytes32 txn_hash;     ///< Keccak hash of transaction RLP    monad_c_address sender;       ///< Recovered sender address    struct monad_c_eth_txn_header        txn_header;               ///< Transaction header};
```

```prism
/// Fields of an Ethereum transaction that are recognized by the monad EVM/// implementation.////// This type contains the fixed-size fields present in any supported/// transaction type. If a transaction type does not support a particular field,/// it will be zero-initialized.struct monad_c_eth_txn_header {    enum monad_c_transaction_type        txn_type;                        ///< EIP-2718 transaction type    monad_c_uint256_ne chain_id;         ///< T_c: EIP-155 blockchain identifier    uint64_t nonce;                      ///< T_n: num txns sent by this sender    uint64_t gas_limit;                  ///< T_g: max usable gas (upfront xfer)    monad_c_uint256_ne max_fee_per_gas;  ///< T_m in EIP-1559 txns or T_p (gasPrice)    monad_c_uint256_ne        max_priority_fee_per_gas;        ///< T_f in EIP-1559 txns, 0 otherwise    monad_c_uint256_ne value;            ///< T_v: wei xfered or contract endowment    monad_c_address to;                  ///< T_t: recipient    bool is_contract_creation;           ///< True -> interpret T_t == 0 as null    monad_c_uint256_ne r;                ///< T_r: r value of ECDSA signature    monad_c_uint256_ne s;                ///< T_s: s value of ECDSA signature    bool y_parity;                       ///< Signature Y parity (see YP App. F)    monad_c_uint256_ne        max_fee_per_blob_gas;            ///< EIP-4844 contribution to max fee    uint32_t data_length;                ///< Length of trailing `data` array    uint32_t blob_versioned_hash_length; ///< Length of trailing `blob_versioned_hashes` array    uint32_t access_list_count;          ///< # of EIP-2930 AccessList entries    uint32_t auth_list_count;            ///< # of EIP-7702 AuthorizationList entries};
```

```prism
struct monad_event_descriptor{    alignas(64) uint64_t seqno;  ///< Sequence number, for gap/liveness check    uint16_t event_type;         ///< What kind of event this is    uint16_t : 16;               ///< Unused tail padding    uint32_t payload_size;       ///< Size of event payload    uint64_t record_epoch_nanos; ///< Time event was recorded    uint64_t payload_buf_offset; ///< Unwrapped offset of payload in p. buf    uint64_t content_ext[4];     ///< Extensions for particular content types};
```

```prism
╔═Payload buffer══════════════════════════════╗                                      ║                                             ║                                      ║  ┏━━━━━━━TXN_HEADER_START payload━━━━━━━━┓  ║                                      ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║                                  ┌───╬──╋─▶─monad_exec_txn_header_start───────┐░┃  ║                                  │   ║  ┃░│                                   │░┃  ║                                  │   ║  ┃░│ monad_c_bytes32 txn_hash;         │░┃  ║                                  │   ║  ┃░│ monad_c_address sender;           │░┃  ║                                  │   ║  ┃░│ struct monad_c_eth_txn_header     │░┃  ║  ╔═Event descriptor array════╗   │   ║  ┃░│     txn_header;                   │░┃  ║  ║                           ║   │   ║  ┃░├───────────────────────────────────┤░┃  ║  ║ ┌───────────────────────┐ ║   │   ║  ┃░│                                   │░┃  ║  ║ │ seqno: 1              □─╬───┘   ║  ┃░│     Transaction data variable     │░┃  ║  ║ │ TXN_HEADER_START      │ ║       ║  ┃░│       length trailing array       │░┃  ║  ║ └───────────────────────┘ ║       ║  ┃░│                                   │░┃  ║  ║                           ║       ║  ┃░│                                   │░┃  ║  ║ ┌───────────────────────┐ ║       ║  ┃░└───────────────────────────────────┘░┃  ║  ║ │ seqno: 2              □─╬────┐  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║ │ TXN_ACCESS_LIST_ENTRY │ ║    │  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║  ║ └───────────────────────┘ ║    │  ║                                             ║  ║                           ║    │  ║  ┏━━━━━TXN_ACCESS_LIST_ENTRY payload━━━━━┓  ║  ║ ┌───────────────────────┐ ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║ │ seqno: 3              │ ║    └──╬──╋─▶─monad_exec_txn_access_list_entry──┐░┃  ║  ║ │ TXN_ACCESS_LIST_ENTRY □─╬────┐  ║  ┃░│                                   │░┃  ║  ║ └───────────────────────┘ ║    │  ║  ┃░│ uint32_t index;                   │░┃  ║  ║                           ║    │  ║  ┃░│ struct monad_c_access_list_entry  │░┃  ║  ║ ┌───────────────────────┐ ║    │  ║  ┃░│     entry;                        │░┃  ║  ║ │ seqno: 4              │ ║    │  ║  ┃░├───────────────────────────────────┤░┃  ║  ║ │ TXN_HEADER_END        │ ║    │  ║  ┃░│       Storage key variable        │░┃  ║  ║ └───────────────────────┘ ║    │  ║  ┃░│       length trailing array       │░┃  ║  ║                           ║    │  ║  ┃░└───────────────────────────────────┘░┃  ║  ║                           ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║                           ║    │  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║  ║                           ║    │  ║                                             ║  ║                           ║    │  ║  ┏━━━━━TXN_ACCESS_LIST_ENTRY payload━━━━━┓  ║  ║                           ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║  ║                           ║    └──╬──╋─▶─monad_exec_txn_access_list_entry──┐░┃  ║  ║                           ║       ║  ┃░│                                   │░┃  ║  ║                           ║       ║  ┃░│ uint32_t index;                   │░┃  ║  ╚═══════════════════════════╝       ║  ┃░│ struct monad_c_access_list_entry  │░┃  ║                                      ║  ┃░│     entry;                        │░┃  ║                                      ║  ┃░├───────────────────────────────────┤░┃  ║                                      ║  ┃░│                                   │░┃  ║                                      ║  ┃░│       Storage key variable        │░┃  ║                                      ║  ┃░│       length trailing array       │░┃  ║                                      ║  ┃░│      (this has more storage       │░┃  ║                                      ║  ┃░│        keys and is larger)        │░┃  ║                                      ║  ┃░│                                   │░┃  ║                                      ║  ┃░└───────────────────────────────────┘░┃  ║                                      ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║                                      ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║                                      ║                                             ║                                      .                                             .                                      .                                             .                                      .                                             .                                      ║                                             ║                                      ╚═════════════════════════════════════════════╝
```

