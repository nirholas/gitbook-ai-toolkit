# Advanced topics

> Source: https://docs.monad.xyz/execution-events/advanced

## Documentation

On this page

When are events published?​
Execution events are recorded roughly "as they are happening" inside the
execution daemon: you see a BLOCK_START event at roughly the same moment
that the execution daemon beings processing a new block, followed by the
start of the first transaction (a TXN_HEADER_START event) about 1 millisecond
later. Most transaction-related events are recorded less than one
microsecond after the transaction they describe has completed.
Execution of a typical transaction will emit a few dozen events, but large
transactions can emit hundreds of events. The TXN_EVM_OUTPUT event -- which
is recorded as soon as the transaction is finished -- provides a summary
accounting of how many more events related to that transaction will follow
(how many logs, how many call frames, etc.), so that memory to store the
subsequent event data can be preallocated. For example in Rust,
Vec::reserve
is often called here. An event like TXN_EVM_OUTPUT is referred as a "header
event" in the documentation: it is an event whose content describes some summary
information and the number of subsequent, related events that will be recorded
later with more details.
All these events are recorded as soon as the transaction is "committed" to the
currently-executing block. This happens before the block has finished
executing, and should not be confused with the unrelated notion of "commitment"
in the consensus algorithm. Although there are complex speculative execution
optimizations inside the execution daemon, the recording of a transaction takes
place when all work on a particular transaction has finished. This is referred
to as "transaction commit" time.
This is a different than the block-at-a-time style update you would see in,
for example, the Geth real-time events WebSocket protocol (which our RPC server
also supports). Certain properties of the block
(its hash, its state root, etc.) are not known at the time you see a
transaction's events, because the rest of the block is still executing. If you
would like block-at-a-time updates, the Rust SDK contains
some utilities
which will aggregate the events back into complete, block-oriented updates.
One thing to be careful of: although transactions are always committed to a
block in index order, they might be recorded out of order. That is, you must
assume that the set of execution events that make up transactions 2 and 3
could be "mixed together" in any order. This is because of optimizations in
the event recording code path.
However, for a particular transaction (e.g., transaction 3) events pertaining
to that transaction are always recorded in the same order: first all of the
logs, then all the call frames, then all the state access records. Each of
these is recorded in index order, i.e., log 2 is always recorded before
log 3.
Consider the following diagram:
  ╔═Events═════════════════════════════╗  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_EVM_OUTPUT   │  ║  ║ │ transaction: 1                │  ║  ║ │ log count:   2                │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 1                │  ║  ║ │ log index:   0                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_EVM_OUTPUT   │  ║  ║ │ transaction: 0                │  ║  ║ │ log count:   3                │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 0                │  ║  ║ │ log index:   0                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 0                │  ║  ║ │ log index:   1                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 1                │  ║  ║ │ log index:   1                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 0                │  ║  ║ │ log index:   2                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ╚════════════════════════════════════╝
A few things to note here:


Unlike most diagrams in the documentation, the events are shown in a
simplified, "merged" form; in real events, some of this information is
stored in the event descriptor and some is stored in the event payload,
but they're combined to make the diagram simpler


It shows two transactions, with transaction indices 0 and 1. Although
transaction 0 completes first in the EVM, its TXN_EVM_OUTPUT event is
recorded after than the TXN_EVM_OUTPUT of transaction 1


Events from the transactions are interleaved: sometimes the next one relates
to transaction 0, sometimes to transaction 1, and there is no meaningful order
between them


Despite the transactions being out-of-order with respect to each other,
all the events associated with a particular transaction are always in relative
order, i.e., the log indicies for a particular transaction will always be seen
in log_index order, as above


This is easy to understand if you imagine all of a transaction's events being
recorded by a different thread. For a particular transaction, its thread always
records that transaction's events in order, but the "transaction threads"
themselves race against each other, recording in a non-deterministic order.
This is similar to what really happens, except the transactions are recorded on
fibers rather than
full threads.
Sequence numbers and the lifetime detection algorithm​
All event descriptors are tagged with an incrementing sequence number
starting at 1. Sequence numbers are 64-bit unsigned integers which do not
repeat unless the execution daemon is restarted. Zero is not valid sequence
number.
Also note that the sequence number modulo the descriptor array size equals
the array index where the next event descriptor will be located. This is
shown below with a concrete example where the descriptor array size is 64.
Note that the last valid index in the array is 63, then access wraps around
to the beginning of the array at index 0.
                                                         ◇                                                         │  ╔═...═════════════════════════Event descriptor array═══╬═══════════════════...═╗  ║                                                      │                       ║  ║     ┌─Event────────┐┌─Event────────┐┌─Event────────┐ │ ┌─Event─────────┐     ║  ║     │              ││              ││              │ │ │               │     ║  ║     │ seqnum = 318 ││ seqnum = 319 ││ seqnum = 320 │ │ │ seqnum = 256  │     ║  ║     │              ││              ││              │ │ │               │     ║  ║     └──────────────┘└──▲───────────┘└──────────────┘ │ └───────────────┘     ║  ║            61          │   62              63        │         0             ║  ╚═...════════════════════╬═════════════════════════════╬═══════════════════...═╝                           │                             │                           ■                             ◇                           Next event                    Ring buffer                                                         wrap-around to      ┌──────────────────────────────┐                   zero is here      │last read sequence number     │      │(last_seqno) is initially 318 │      └──────────────────────────────┘
In this example:


We keep track of the "last seen sequence number" (last_seqno) which has
value 318 to start; being the "last" sequence number means we have already
finished reading the event with this sequence number, which lives at array
index 61


318 % 64 is 62, so we will find the potential next event at that index
if it has been produced


Observe that the sequence number of the item at index 62 is 319, which
is the last seen sequence number plus 1 (319 == 318 + 1). This means that
event 319 has been produced, and its data can be safely read from that
slot


When we're ready to advance to the next event, the last seen sequence
number will be incremented to 319. As before, we can find the next
event (if it has been produced) at 319 % 64 == 63. The event at this
index bears the sequence number 320, which is again the last seen
sequence number + 1, therefore this event is also valid


When advancing a second time, we increment the last seen sequence number
to 320. This time, the event at index 320 % 64 == 0 is not 321,
but is a smaller number, 256. This means the next event has not been
written yet, and we are seeing an older event in the same slot. We've
seen all of the currently available events, and will need to check again
later once a new event is written


Alternatively we might have seen a much larger sequence number, like
384 (320 + 64). This would mean that we consumed events too slowly, so
slowly that the 63 events in the range [321, 384) were produced in the
meantime. These were subsequently overwritten, and are now lost. They can
be replayed using services external to event ring API, but within the
event ring API itself there is no way to recover them


Lifetime of an event payload, zero copy vs. memcpy APIs​
Because of the descriptor overwrite behavior, an event descriptor might be
overwritten by the execution daemon while a reader is still examining its
data. To deal with this, the reader API makes a copy of the event descriptor.
If it detects that the event descriptor changed during the copy operation, it
reports a gap. Copying an event descriptor is fast, because it is only a
single cache line in size.
This is not the case for event payloads, which could potentially be very
large. This means a memcpy(3) of an event payload could be expensive, and
it would be advantageous to read the payload bytes directly from the payload
buffer's shared memory segment: a "zero-copy" API. This exposes the user to
the possibility that the event payload could be overwritten while still
using it, so two solutions are provided:


A simple detection mechanism allows payload overwrite to be detected at
any time: the writer keeps track of the minimum payload offset value
(before modular arithmetic is applied) that is still valid. If the
offset value in the event descriptor is smaller than this, it is no
longer safe to read the event payload


A payload memcpy-style API is also provided. This uses the detection
mechanism above in the following way: first, the payload is copied to
a user-provided buffer. Before returning, it checks if the lifetime
remained valid after the copy finished. If so, then an overwrite did not
occur during the copy, so the copy must be valid. Otherwise, the copy is
invalid


The reason to prefer the zero-copy APIs is that they do less work. The
reason to prefer memcpy APIs is that it is not always easy (or possible) to
"undo" the work you did if you find out later that the event payload was
corrupted by an overwrite while you were working with it. The most logical
thing to do in that case is start by copying the data to stable location,
and if the copy isn't valid, to never start the operation.
An example user of the zero-copy API is the eventwatch example C program,
which can turn events into printed strings that are sent to stdout. The
expensive work of formatting a hexdump of the event payload is performed
using the original payload memory. If an overwrite happened during the
string formatting, the hexdump output buffer will be wrong, but that is OK:
it will not be sent to stdout until the end. Once formatting is complete,
eventwatch checks if the payload expired and if so, writes an error to
stderr instead of writing the formatted buffer to stdout.
Whether you should copy or not depends on the characteristics of the reader,
namely how easily it can deal with "aborting" processing.
Location of event ring files​
For performance reasons, we prefer that event ring files be created on a
hugetlbfs
in-memory filesystem. Files created on such a filesystem will be backed by
physically-contiguous large pages, which improves performance by about 15% in
internal benchmarks.
This can be a hassle though: it is unusual for a program to require that a
file be placed on a particular kind of filesystem, and this requirement adds
some overhead. In practice, this means additional configuration steps that a
system administrator must perform when setting up a Monad node, and some
additional concepts that SDK users must learn about.
The issues are:


A hugetlbfs filesystem must be mounted somewhere on the host; usually by
default (e.g., on a Ubuntu default installation) there will not be a
hugetlbfs filesystem already present


Whomever configures a hugetlbfs filesystem must make sure that any user
that needs to open the event ring file has the appropriate permissions


The path to the event ring file (which will be somewhere on that filesystem)
must be passed into all programs that need to open it; since we don't know
where the administrator will mount the filesystem, we can't easily hard-code
a location for it in either the documentation or the source code


To simplify the developer experience as much as possible, we follow three
conventions. Each convention adds more "convenience default behavior" so that
everything will "just work" for most users, but you are free to ignore any of
the conventions and do things in your own way.
hugetlbfs is not requiredThe event ring library does not require a hugetlbfs filesystem: it can work
with any kind of regular file.  The C function that maps an event ring's
shared memory segments -- monad_event_ring_mmap -- only takes a file
descriptor, and does not know or care where this descriptor comes from. The
only constraints on it are those placed by the mmap(2) system call itself.These conventions are about adding a reasonable default for how the mount
point is set up, and helper functions for finding event ring files in that
location. You should try to use them because they provide a performance
benefit, but you are free to come up with a file descriptor in any way you
wish and it will work with monad_event_ring_mmap.
Convention 1: libhugetlbfs in the node setup guide​
The
official guide
for setting up a local Monad node for execution events recommends the use
of libhugetlbfs.
libhugetlbfs is both a C library and a set of admin tools using that
library that follow a particular configuration convention. The idea is to
standardize some rules for how mount points and permissions are managed for
hugetlbfs filesystems. There are three parts to the basic idea:


Each user (or group if you want to do it that way) gets its own
separately-mounted hugetlbfs filesystem. The mount point is located in a
well-defined place under /var/lib/hugetlbfs/user/<user-name>1


hugeadm, a program that a system administrator runs, is a configuration
front-end for tasks like listing hugetlbfs mounts, creating new mounts, etc.


The C library, libhugetlbfs, helps client programs "find" hugetlbfs mounts
that the current user has permission to access


The setup guide for the Monad node tells the user to install the libhugetlbfs
command line tools and to set up a "user mount" for the monad user. The guide
also recommends that all users be given access to enter this directory, so that
data consumer applications that run as non-monad users can open the file.
Convention 2: "default" event ring directory​
The event ring library introduces the concept of a "default event ring
directory."  This is the default directory where event ring files should be
created, and thus where reader applications should look for them. This default
can come from one of two places:


You can provide it manually OR


If you don't provide it, the library will use a conventional location


The conventional location is a subdirectory called event-rings, created
directly under whatever hugetlbfs mount point is returned by libhugeltbfs2,
i.e., it is:
<libhugeltbfs-computed-mount-point>/event-rings
If you follow the setup guide to the letter, this should be:
/var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings
But depending on how your system is setup, libhugetlbfs could return a
different path. For example, you might see something like this:
/dev/hugepages/event-rings
This is because libhugeltbfs scrapes the contents of /proc/mounts and
returns only one path that the current user has
access
to. What if the user has access to multiple hugetlbfs mounts? There is no
logic to prefer one flavor of path over another, it only depends on their
relative ordering in the /proc/mounts file.
Providing the default event ring directory manually​
You may wish to use this "open from the default directory" configuration idiom
while by-passing libhugetlbfs. The two reasons to do that are:


If you don't want the event ring file to be present on a hugetlbfs file
system at all; this is usually when you want to create an event ring file
larger than the hugetlbfs mount point (or the system's underlying pool of
huge pages) would allow


If you do not want to use libhugetlbfs as a library dependency of your
project, in which case you will want to set the CMake
MONAD_EVENT_USE_LIBHUGETLBFS option to OFF


Convention 3: event ring filename resolution​
The "default directory" concept is used in the final convention, which is a
"convenience" API call for turning user input for an event ring file into
the path where your program will attempt to open that file.
It allows users to specify a filename such as xyz and have it be translated
to a full (and ugly) path like this:
/var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/xyz
while still allowing the user to be able to specify any file, including one
not in the default directory, if they wish.
Here is how event ring file inputs are resolved by the the C function
monad_event_ring_resolve_file and the Rust function EventRingPath::resolve:


If a "pure" filename is provided (i.e., a filename with no / character),
it is resolved relative to a provided default_path directory


Otherwise (i.e., if the file contains any / character), it is resolved
relative to the current working directory; if / is the first character,
it is resolved as an absolute path


This is similar to how a UNIX shell resolves a command name. A "pure" name
with no path characters is resolved relative to the entries in the $PATH
environment variable (i.e., it searches the default command directories). The
presence of a path-separator character causes the input to be treated like a
specific path relative to the current directory, which disables this "search".
This familiar principal applies here.
Furthermore:


In C you usually pass the sentinel value MONAD_EVENT_DEFAULT_HUGETLBFS
(which is just an alias for nullptr) as the default_path parameter; this
causes libhugetlbfs to figure out what the default hugetlbfs root path
should be3; in Rust this is just EventRingPath::resolve


You can provide your own default_path value, which can be on any path on
any filesystem; this is required if you don't want libhugetlbfs as a
dependency; in Rust this is EventRingPath::resolve_with_default_path


Resolution is only about generating path namesResolution does not try to open a file: it just standardizes the convention for
how to build a path string from the two inputs. Namely, it does not check
whether the computed file path exists or not.Remember that the event ring library itself only cares about file descriptors,
and none of its APIs (even the "helper" APIs) attempt to
open(2) a file. They just
provide "reasonable default" ways of locating files that programs can opt into.
If your host needs to set up your filesystem mounts differently, you are free to
do that.
Examples​
The table below shows how the C function monad_event_ring_resolve_file
behaves. <cwd> is the process' current working directory and <htlbfs>
is the mount point returned by libhugetlbfs.
default_path valueinput valueresolve file returns...NotesMONAD_EVENT_DEFAULT_HUGETLBFS"xyz""<htlbfs>/event-rings/xyz"MONAD_EVENT_DEFAULT_HUGETLBFS"a/b/c""<cwd>/a/b/c"default_path only affects "pure" file namesMONAD_EVENT_DEFAULT_HUGETLBFS  "/d/e/f""/d/e/f"absolute paths always remain absoluteMONAD_EVENT_DEFAULT_HUGETLBFS"monad-exec-events""<htlbfs>/event-rings/monad-exec-events"the default event ring file name used by the execution daemon"/tmp/my-event-ring-path""xyz""/tmp/my-event-ring-path/xyz"intermediate directories will be created if not existing"/tmp/my-event-ring-path""a/b/c""<cwd>/a/b/c""/tmp/my-event-ring-path""/d/e/f""/d/e/f"
In Rust, EventRingPath::resolve behaves like the MONAD_EVENT_DEFAULT_HUGETLBFS
rows, and EventRingPath::resolve_with_default_path takes an explicit
basepath argument and behaves like the bottom three rows.

Footnotes​


Other configuration schemes are possible too, see
man hugeadm ↩


The exact path might be user-dependent, and is determined by the
function hugetlbfs_find_path_for_size ↩


The actual function used is the event ring library's utility function
monad_event_open_hugetlbfs_dir_fd, which adds in the event-rings
subdirectory path component and creates it if it does not already exist ↩

## Code Examples

```prism
╔═Events═════════════════════════════╗  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_EVM_OUTPUT   │  ║  ║ │ transaction: 1                │  ║  ║ │ log count:   2                │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 1                │  ║  ║ │ log index:   0                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_EVM_OUTPUT   │  ║  ║ │ transaction: 0                │  ║  ║ │ log count:   3                │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 0                │  ║  ║ │ log index:   0                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 0                │  ║  ║ │ log index:   1                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 1                │  ║  ║ │ log index:   1                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ║ ┌───────────────────────────────┐  ║  ║ │ event type:  TXN_LOG          │  ║  ║ │ transaction: 0                │  ║  ║ │ log index:   2                │  ║  ║ │ <log details>                 │  ║  ║ └───────────────────────────────┘  ║  ║                                    ║  ╚════════════════════════════════════╝
```

```prism
◇                                                         │  ╔═...═════════════════════════Event descriptor array═══╬═══════════════════...═╗  ║                                                      │                       ║  ║     ┌─Event────────┐┌─Event────────┐┌─Event────────┐ │ ┌─Event─────────┐     ║  ║     │              ││              ││              │ │ │               │     ║  ║     │ seqnum = 318 ││ seqnum = 319 ││ seqnum = 320 │ │ │ seqnum = 256  │     ║  ║     │              ││              ││              │ │ │               │     ║  ║     └──────────────┘└──▲───────────┘└──────────────┘ │ └───────────────┘     ║  ║            61          │   62              63        │         0             ║  ╚═...════════════════════╬═════════════════════════════╬═══════════════════...═╝                           │                             │                           ■                             ◇                           Next event                    Ring buffer                                                         wrap-around to      ┌──────────────────────────────┐                   zero is here      │last read sequence number     │      │(last_seqno) is initially 318 │      └──────────────────────────────┘
```

```prism
<libhugeltbfs-computed-mount-point>/event-rings
```

```prism
/var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings
```

```prism
/dev/hugepages/event-rings
```

```prism
/var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/xyz
```

