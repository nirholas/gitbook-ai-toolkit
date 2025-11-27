# C API

> Source: https://docs.monad.xyz/execution-events/c-api

## Documentation

On this page

Core concepts​
There are two central objects in the event ring C API. They are:

struct monad_event_ring - represents an event ring whose shared memory
segments have been mapped into the address space of the current process;
the primary thing the client does with this object is use it to initialize
iterators that point into the event ring, using the
monad_event_ring_init_iterator function
struct monad_event_iterator - the star of the show: this iterator
object is used to read sequential events. The iterator's try_next
operation copies the current event descriptor (if it is available) and
if successful, advances the iterator. Conceptually, it behaves like the
expression descriptor = *i++, if an event descriptor is ready immediately
(it does nothing otherwise)

The easiest way to understand the API is to compile and run the included
eventwatch example program. This program dumps ASCII representations of
execution events to stdout, as they are written by a execution daemon
running on the same host.
In eventwatch, the event descriptors are fully decoded, but the event
payloads are only shown in hexdump form, because this simple program that does
not include pretty-printing logic for all event payload types. The program is
only 250 lines of code, and reading through it should explain how the various
API calls fit together.
The SDK also includes C++20
std::formatter
specializations which can fully decode event payloads into human-readable form.
These are used by the eventcap utility program.
Using the API in your project​
libmonad_event is designed for third party integration, so it does not have
any library dependencies aside from a recent version of glibc. This also means
it has no dependency on the rest of the monad repository or on its build
system: the sole requirement is a C compiler supporting C23.
The "Getting start" guide to building the C example program
discusses several ways
to use the SDK library as a third-party dependency in your code. Alternatively,
the source files that make up the library target can be copied into your own
codebase. A Rust client library is also available.
API overview​
Event ring APIs​
APIPurposemonad_event_ring_mmapGiven a file descriptor to an open event ring file, map its shared memory segments into the current process, initializing a struct monad_event_ringmonad_event_ring_init_iteratorGiven a pointer to a struct monad_event_ring, initialize an iterator that can read from the event ringmonad_event_ring_try_copyGiven a specific sequence number, try to copy the event descriptor for it, if it hasn't been overwrittenmonad_event_ring_payload_peekGet a zero-copy pointer to an event payloadmonad_event_ring_payload_checkCheck if an event payload referred to by a zero-copy pointer has been overwrittenmonad_event_ring_memcpymemcpy the event payload to a buffer, succeeding only if the payload is not expiredmonad_event_ring_get_last_errorReturn a human-readable string describing the last error that occurred on this thread
All functions which can fail will return an errno(3) domain error code
diagnosing the reason for failure. The function
monad_event_ring_get_last_error can be called to provide a human-readable
string explanation of what failed.
Event iterator APIs​
APIPurposemonad_event_iterator_try_nextIf an event descriptor if is available, copy it and advance the iterator; behaves like *i++, but only if *i is readymonad_event_iterator_try_copyCopy the event descriptor at the current iteration point, without advancing the iteratormonad_event_iterator_resetReset the iterator to point to the most recently produced event descriptor; used for gap recoverymonad_exec_iter_consensus_prevRewinds an iterator to the previous consensus event (BLOCK_START, BLOCK_QC, BLOCK_FINALIZED, or BLOCK_VERIFIED)monad_exec_iter_block_number_prevRewinds an iterator to the previous consensus event for the given block numbermonad_exec_iter_block_id_prevRewinds an iterator to the previous consensus event for the given block IDmonad_exec_iter_rewind_for_simple_replayRewinds an iterator to replay events you may have missed, based on the last finalized block you saw
Event ring utility APIs​
APIPurposemonad_event_ring_check_content_typeCheck if the binary layouts of event definitions used by the library match what is recorded in a mapped event ringmonad_event_ring_find_writer_pidsFind processes that have opened an event ring file descriptor for writing; used for detecting publisher exitmonad_check_path_supports_map_hugetlbCheck if a path is on a filesystem that allows its files to be mmap'ed with MAP_HUGETLBmonad_event_open_hugetlbfs_dir_fdOpen the default hugetlbfs directory where event ring files are created1monad_event_resolve_ring_fileIf a path contains no / character (i.e., if it is a "pure" filename), resolve it relative to some default event ring directory2monad_event_is_snapshot_fileCheck if a path refers to an event ring snapshot filemonad_event_decompress_snapshot_fdDecompress the event ring snapshot contained in the given file descriptormonad_event_decompress_snapshot_memDecompress the event ring snapshot contained in the given memory buffer
Library organization​
Event ring files in libmonad_event:
FileContainsevent_ring.{h,c}Definitions of core shared memory structures for event rings, and the API that initializes and mmaps event ring filesevent_iterator.hDefines the basic event iterator object and its APIevent_iterator_inline.hDefinitions of the event_iterator.h functions, all of which are inlined for performance reasonsevent_metadata.hStructures that describe event metadata (string names of events, descriptions of events, etc.)exec_iter_help.hAPI for rewinding the the iterator to point to block executions or consensus events
Execution event files in libmonad_event:
FileContainsbase_ctypes.hDefinitions of basic vocabulary types common in Ethereum data (e.g., 256 bit integer types, etc).eth_ctypes.hDefinitions of structures used in the Ethereum virtual machineexec_event_ctypes.hDefinition of execution event payload structures, and the event type enumeration enum monad_exec_event_typeexec_event_ctypes_metadata.cDefines static metadata about execution events, and the schema hash value arraymonad_ctypes.hDefinitions of Monad blockchain extensions to Ethereum
Supporting files in libmonad_event:
FileContainsevent_ring_util.{h,c}Convenience functions that are useful in most event ring programs, but which are not part of the core APIformat_err.{h,c}Helper utility from the execution codebase used to implement the monad_event_ring_get_last_error() functionsrcloc.hHelper utility used with the format_err.h API, for capturing source code locations in C
Other files in the SDK:
FileContentseventwatch.cA sample program that shows how to use the API*_fmt.hpp filesFiles ending in _fmt.hpp are used with C++ <format> and contain std::formatter specializations for SDK typeshex.hpp<format> hexdump utility used by the _fmt.hpp files to dump uint8_t[] values

Footnotes​


By default, this returns the a path on a hugetlbfs mount, as computed by
libhugetlbfs ↩


If compiling with MONAD_EVENT_USE_LIBHUGETLBFS=OFF, a default event
ring directory must be specified; see
here for details ↩

