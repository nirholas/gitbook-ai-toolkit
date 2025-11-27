# Event rings in detail

> Source: https://docs.monad.xyz/execution-events/event-ring

## Documentation

On this page

Event ring files and content types​
Event rings are made up of four shared memory segments. Two of these -- the
event descriptor array and payload buffer -- are described in the
overview documentation.
The third shared memory segment contains a header that describes metadata
about the event ring. The fourth (the "context area") is a special feature
that is not needed for execution events.
The shared memory segments are mapped into a process' address space using
mmap(2). This means
that the event ring's data structures live in a file somewhere, and that
shared access to it is obtained by creating shared memory mappings of that
file.
Most of the time an event ring is a regular file, created on a special
in-memory file system called
hugetlbfs. hugetlbfs is similar to the
tmpfs in-memory
filesystem, but supports the creation of files backed by large page sizes.
The use of large pages is just an
optimization: event ring files may be
created on any file system. If the execution daemon is told to create an
event ring file on a filesystem without hugetlb mmap support, it will log a
performance warning but will still create the file. To learn more about
hugetlbfs and how it is used, read
this page.
Event ring configuration​
To use execution events, the execution daemon must be started with the command
line parameter:
--exec-event-ring [<event-ring-configuration-string>]
Without this command line parameter, execution will not publish any events.
This command line parameter (and mounting a hugetlbfs filesystem, for that
matter) are not part of the default configuration instructions for the
execution daemon. A
separate guide
covers mounting a hugetlbfs filesystem and modifying the command line in
the systemd unit configuration files.
Note that the configuration string is optional; if you pass --exec-event-ring
without an argument (which is the recommended thing to do), this is equivalent
to passing --exec-event-ring monad-exec-events, where monad-exec-events is
the default execution event ring file name.
The event ring configuration string has the form:
<ring-name-or-file-path>[:<descriptor-shift>:<payload-buffer-shift>]
In other words, the configuration string consists of three :-separated
fields; the first field is required but the second two are optional. Here
is an example of the command line parameter, with just the first field:
--exec-event-ring /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events
and another example, with all three:
--exec-event-ring monad-exec-events:21:29
The first field is the name of the event ring file. The execution daemon
interprets this field in two different ways:


If it is purely a file name -- i.e., if the path does not contain any /
characters -- then it is interpreted as a file living in the default
event ring file directory; this is the directory returned by the API
function monad_event_open_ring_dir_fd; it uses
libhugetlbfs to locate
the most suitable mount point for a hugetlbfs file system, and automatically
creates subdirectory called event-rings underneath that, if it does not
already exist (see here for
more information); the event ring file will be created in that event-rings
subdirectory


If the path has multiple path components -- i.e., if it contains at least
one / character -- then this path will be used as written even if it is
not resident on a hugetlbfs file system; the rationale for why someone
might want this is explained below


The "shift" parameters are power-of-two exponents that determine the event
ring's size.1 A <descriptor-shift> of 21 means there will be 2^21
descriptors in the ring's event descriptor array. This means approximately 2
million events can be written before the descriptor ring buffer wraps around
and overwrites older event descriptors.
A <payload-buffer-shift> of 29 means there will be 2^29 bytes in the payload
buffer array. This means 512 MiB worth of event payloads can be recorded before
the payload buffer wraps around and overwrites an older event's payload.
If the event ring size parameters are not specified, then default values are
used. Why might you increase these values from their defaults? If your reader
program crashes, but execution does not, then you will likely miss some events
during the time when your program is not running. Your application might not
care about lost events for old blocks, but if it does, you'll need to retrieve
them somehow.
If not much time has gone by, chances are good that the events you are missing
are still sitting there in the event ring memory, i.e., are not overwritten
yet. The default sizes are large enough to hold several minutes worth of
blocks at 10k TPS. Increasing these values allows you to rewind further back
in time.
Be aware that there is a fixed-size pool of huge pages. The pool size can be
changed by modifying the system's configuration, see the discussion of
/proc/sys/vm/nr_hugepages
here.
If an event ring is created on a hugetlbfs mount, and its size exceeds the
number of available huge pages, then the execution daemon will exit with an
error message that reports a "no space left on device" error. For example,
here we tried to allocate an event ring with a one terabyte payload buffer:
LOG_ERROR  event library error -- monad_event_ring_init_simple@event_ring_util.c:78:posix_fallocate failed for event ring file `/dev/hugepages/monad-exec-events`, size 1099647942656: No space left on device (28)
If you happen to have multiple terabytes of main memory available, you
could pass a file path containing a / character to a file on a tmpfs
mount and it would work, e.g., --exec-event-ring /my-giant-tmpfs/monad-exec-events.
If you need to rewind back especially far -- or if you are missing events
because execution itself has crashed -- then you will need to use alternative
recovery methods described elsewhere.2
Event ring file format​
The event ring file format is simple: all four sections are laid out
sequentially and aligned to a large page boundary, and the header describes
the size of each section.
╔═Event ring file══╗║ ┌──────────────┐ ║║ │              │ ║║ │    Header    │ ║║ │              │ ║║ ├──────────────┤ ║║ │              │ ║║ │    Event     │ ║║ │  Descriptor  │ ║║ │    Array     │ ║║ │              │ ║║ ├──────────────┤ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │   Payload    │ ║║ │    Buffer    │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ ├──────────────┤ ║║ │              │ ║║ │   Context    │ ║║ │     Area     │ ║║ │              │ ║║ └──────────────┘ ║╚══════════════════╝
The descriptor array is a just an array of struct monad_event_descriptor
objects, and the payload buffer is a flat byte array (i.e., it has type
uint8_t[]). The header structure is defined this way:
/// Event ring shared memory files start with this header structurestruct monad_event_ring_header{    char magic[6];                           ///< 'RINGvv', vv = version number    enum monad_event_content_type        content_type;                        ///< Kind of events in this ring    uint8_t schema_hash[32];                 ///< Ensure event definitions match    struct monad_event_ring_size size;       ///< Size of following structures    struct monad_event_ring_control control; ///< Tracks ring's state/status};
Event content types​
The content_type header field is needed because the event ring library --
both the reader and writer APIs -- performs unstructured I/O: the functions
read and write raw uint8_t[] event payloads, and the event descriptors
contain plain uint16_t numerical event codes. Much like the UNIX read(2)
and write(2) file I/O system calls, the event ring API functions do not
inherently know the format of data they are working with. This is the
reason why the event_type field in the event descriptor is the generic
integer type uint16_t instead of enum monad_exec_event_type.
The assumption here is that the reader and writer know the binary format of
the data they're both working with, and they treat the raw data as if it has
this format by type-casting it when needed, e.g.,
const struct monad_exec_block_start *block_start = nullptr;
// We assume that the event ring file we opened contains execution events,// and thus further assume that it makes sense to compare `event->event_type`// to a value of type `enum monad_exec_event_type`if (event->event_type == MONAD_EXEC_BLOCK_START) {    // Since this is MONAD_EXEC_BLOCK_START, we can cast the `const void *`    // payload to a `const struct monad_exec_block_start *` payload.    // Note: implicit type-casting from `void *` is allowed in C, but not C++    block_start = monad_event_ring_payload_peek(event_ring, event);}
We need some kind of error-detection mechanism to ensure this is safe to do.
The event ring file header contains a "content type" enumeration constant
explaining what kind of event data it contains:
enum monad_event_content_type : uint16_t{    MONAD_EVENT_CONTENT_TYPE_NONE,  ///< An invalid value    MONAD_EVENT_CONTENT_TYPE_TEST,  ///< Used in simple automated tests    MONAD_EVENT_CONTENT_TYPE_EXEC,  ///< Core execution events    MONAD_EVENT_CONTENT_TYPE_PERF,  ///< Performance tracer events    MONAD_EVENT_CONTENT_TYPE_COUNT  ///< Total number of known event rings};
The execution events are always recorded to a ring with content_type
equal to MONAD_EVENT_CONTENT_TYPE_EXEC.
Binary schema versioning: the schema_hash field​
If content_type is equal to MONAD_EVENT_CONTENT_TYPE_EXEC, then we know a
ring is supposed to execution events, but what if the event payload definitions
change? Or what if the enumeration constants in enum monad_exec_event_type
change?
Suppose that a user compiles their application with a particular version
of exec_event_ctypes.h, the file which defines the execution event payloads
and the event type enumeration.
Now imagine that some time later, the user deploys a new version of the
execution node, which was compiled with a different version of
exec_event_ctypes.h, causing the memory representation of the event payloads
to be different.
If the reader does not remember to recompile their application with the new
header, it could misinterpret the bytes in the event payloads, assuming they
have the old layout from their old (compile-time) version of
exec_event_ctypes.h.
To prevent these kinds of errors, the binary layout of all event payloads is
summarized by a hash value which changes any time a change is made to any event
payload for that content type. In addition to payload changes, any change to
enum monad_exec_event_type will also generate a new hash.
This mechanism is called the "schema hash", and the hash value is present as
a global, read-only byte array inside the library code (defined in
exec_event_ctypes_metadata.c).
If the hash value in this array does not match the hash value in the event ring
file header, then the binary formats are incompatible.
A helper function called monad_event_ring_check_content_type is used to
check that an event ring file has both the expected content type, and the
expected schema hash for that content type. Here is an example of it being
called in the eventwatch.c sample program:
struct monad_event_ring exec_ring;
/* initialization of `exec_ring` not shown */
if (monad_event_ring_check_content_type(        &exec_ring,        MONAD_EVENT_CONTENT_TYPE_EXEC,        g_monad_exec_event_schema_hash) != 0) {    errx(EX_SOFTWARE, "event library error -- %s",         monad_event_ring_get_last_error());}
If the type of event ring is not MONAD_EVENT_CONTENT_TYPE_EXEC or if the
schema_hash in the file header does not match the value contained in the
global array uint8_t g_monad_exec_event_schema_hash[32], this function will
return the errno(3) domain code EPROTO.
Event descriptors in detail​
Binary format​
The event descriptor is defined this way:
struct monad_event_descriptor{    alignas(64) uint64_t seqno;  ///< Sequence number, for gap/liveness check    uint16_t event_type;         ///< What kind of event this is    uint16_t : 16;               ///< Unused tail padding    uint32_t payload_size;       ///< Size of event payload    uint64_t record_epoch_nanos; ///< Time event was recorded    uint64_t payload_buf_offset; ///< Unwrapped offset of payload in p. buf    uint64_t content_ext[4];     ///< Extensions for particular content types};
Flow tags: the content_ext fields in execution event rings​
For each content type, we may want to publish additional data directly in the
event descriptor, e.g., if that data is common to every payload type or if it
would help the reader quickly filter out events they are not interested in,
without needing to examine the event payload. This additional data is stored
in the content_ext ("content extensions") array, and its meaning is defined
by the content_type.
For execution event rings, the first three values of the content_ext array
are sometimes filled in. The value at each index in the array has the semantic
meaning described by the following enumeration type, which is defined in
exec_event_ctypes.h:
/// Stored in event descriptor's `content_ext` array to tag the/// block & transaction context of eventenum monad_exec_flow_type : uint8_t{    MONAD_FLOW_BLOCK_SEQNO = 0,    MONAD_FLOW_TXN_ID = 1,    MONAD_FLOW_ACCOUNT_INDEX = 2,};
For example, if we have an event descriptor
struct monad_event_descriptor event;
And its contents are initialized by a call to monad_event_iterator_try_next,
then event.content_ext[MONAD_FLOW_TXN_ID] will contains the "transaction ID"
for that event. The transaction ID is equal to the transaction index plus one,
and it is zero if the event has no associated transaction (e.g., the start of
a new block).
The idea behind the "flow" tags is that they tag events with the context they
belong to. For example, when a transaction accesses a particular account
storage key, a STORAGE_ACCESS event is emitted.
By looking at the content_ext array for the STORAGE_ACCESS event descriptor,
the reader can tell it is a storage access made (1) by the transaction with
index event.content_ext[MONAD_FLOW_TXN_ID] - 1 and (2) to the account with
index event.content_ext[MONAD_FLOW_ACCOUNT_INDEX] (this index is related to
an earlier ACCOUNT_ACCESS event series that will have already been seen).
Flow tags are used for two reasons:


Fast filtering - if we are processing 10,000 transactions per second,
and there are at least a dozen events per transaction, then we only have
about 10 microseconds to process each event or we'll eventually fall behind
and gap. At timescales like these, even touching the memory containing the
event payload is expensive, on a relative basis. The event payload lives on
a different cache line -- one that is not yet warm in the reader's CPU --
and the cache line ownership must first be changed in the cache coherence
protocol (because it was recently exclusively owned by the writer, and now
must be shared with the reading CPU, causing cross-core bus traffic). For
most applications, the user can identify transactions IDs they are
interested in at the time of the TXN_HEADER_START event, and then any
event without an interesting ID can be ignored. Because the IDs are a dense
set of integers, a simple array of type bool[TXN_COUNT + 1] can be
used to efficiently look up whether subsequent events associated with that
transaction are interesting (this can be made even more efficient using
a single bit instead of a full bool per transaction)


Compression - the account of a STORAGE_ACCESS is referred to by an
index (which refers to an earlier ACCOUNT_ACCESS event) because an
account address is 20 bytes: large enough that it cannot fit in the two
remaining content_ext array slots


The compression technique is also used for storing the block associated with
an event, in event.content_ext[MONAD_FLOW_BLOCK_SEQNO]. The flow tag in this
case is the sequence number of the BLOCK_START event that started the
associated block. A few things to note about this flow tag:


Sometimes it is zero (an invalid sequence number), which means the event
is not associated with any block; although most events are scoped to a
block, the consensus state change events (BLOCK_QC, BLOCK_FINALIZED,
and BLOCK_VERIFIED) do not occur inside a block


Note that the block flow tag is not the block number. This is because
at the time events are seen, the blocks are in the "proposed" state, and
the consensus algorithm has not finished voting on whether or not the block
will be included in the canonical blockchain (this is discussed extensively
in the next section). Until a block becomes finalized, the only unambiguous
way to refer to it is by its unique ID, which is 32-byte hash value (which
can be read from the BLOCK_START payload); thus the block flow tag is also
a form of compression


Having the sequence number allows us to rewind the iterator to the start
of the block, if we start observing the event sequence in the middle of
a block (e.g., if the reader starts up after the execution daemon). An
example of this (and a detailed explanation of it) can be found in the
eventwatch.c example program, in the find_initial_iteration_point
function



Footnotes​


They are called "shifts" because 1UL << x is equal to 2^x ↩


The alternative recovery methods are still in development and will be
available in the next SDK release ↩

## Code Examples

```prism
--exec-event-ring [<event-ring-configuration-string>]
```

```prism
<ring-name-or-file-path>[:<descriptor-shift>:<payload-buffer-shift>]
```

```prism
--exec-event-ring /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events
```

```prism
--exec-event-ring monad-exec-events:21:29
```

```prism
LOG_ERROR  event library error -- monad_event_ring_init_simple@event_ring_util.c:78:posix_fallocate failed for event ring file `/dev/hugepages/monad-exec-events`, size 1099647942656: No space left on device (28)
```

```prism
╔═Event ring file══╗║ ┌──────────────┐ ║║ │              │ ║║ │    Header    │ ║║ │              │ ║║ ├──────────────┤ ║║ │              │ ║║ │    Event     │ ║║ │  Descriptor  │ ║║ │    Array     │ ║║ │              │ ║║ ├──────────────┤ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │   Payload    │ ║║ │    Buffer    │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ │              │ ║║ ├──────────────┤ ║║ │              │ ║║ │   Context    │ ║║ │     Area     │ ║║ │              │ ║║ └──────────────┘ ║╚══════════════════╝
```

```prism
/// Event ring shared memory files start with this header structurestruct monad_event_ring_header{    char magic[6];                           ///< 'RINGvv', vv = version number    enum monad_event_content_type        content_type;                        ///< Kind of events in this ring    uint8_t schema_hash[32];                 ///< Ensure event definitions match    struct monad_event_ring_size size;       ///< Size of following structures    struct monad_event_ring_control control; ///< Tracks ring's state/status};
```

```prism
const struct monad_exec_block_start *block_start = nullptr;
// We assume that the event ring file we opened contains execution events,// and thus further assume that it makes sense to compare `event->event_type`// to a value of type `enum monad_exec_event_type`if (event->event_type == MONAD_EXEC_BLOCK_START) {    // Since this is MONAD_EXEC_BLOCK_START, we can cast the `const void *`    // payload to a `const struct monad_exec_block_start *` payload.    // Note: implicit type-casting from `void *` is allowed in C, but not C++    block_start = monad_event_ring_payload_peek(event_ring, event);}
```

```prism
enum monad_event_content_type : uint16_t{    MONAD_EVENT_CONTENT_TYPE_NONE,  ///< An invalid value    MONAD_EVENT_CONTENT_TYPE_TEST,  ///< Used in simple automated tests    MONAD_EVENT_CONTENT_TYPE_EXEC,  ///< Core execution events    MONAD_EVENT_CONTENT_TYPE_PERF,  ///< Performance tracer events    MONAD_EVENT_CONTENT_TYPE_COUNT  ///< Total number of known event rings};
```

```prism
struct monad_event_ring exec_ring;
/* initialization of `exec_ring` not shown */
if (monad_event_ring_check_content_type(        &exec_ring,        MONAD_EVENT_CONTENT_TYPE_EXEC,        g_monad_exec_event_schema_hash) != 0) {    errx(EX_SOFTWARE, "event library error -- %s",         monad_event_ring_get_last_error());}
```

```prism
struct monad_event_descriptor{    alignas(64) uint64_t seqno;  ///< Sequence number, for gap/liveness check    uint16_t event_type;         ///< What kind of event this is    uint16_t : 16;               ///< Unused tail padding    uint32_t payload_size;       ///< Size of event payload    uint64_t record_epoch_nanos; ///< Time event was recorded    uint64_t payload_buf_offset; ///< Unwrapped offset of payload in p. buf    uint64_t content_ext[4];     ///< Extensions for particular content types};
```

```prism
/// Stored in event descriptor's `content_ext` array to tag the/// block & transaction context of eventenum monad_exec_flow_type : uint8_t{    MONAD_FLOW_BLOCK_SEQNO = 0,    MONAD_FLOW_TXN_ID = 1,    MONAD_FLOW_ACCOUNT_INDEX = 2,};
```

```prism
struct monad_event_descriptor event;
```

