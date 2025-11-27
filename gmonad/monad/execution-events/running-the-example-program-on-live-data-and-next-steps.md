# Running the example program on live data, and next steps

> Source: https://docs.monad.xyz/execution-events/getting-started/final

## Documentation

On this page

If you're following this guide in order, you should have already built one
of the example programs (in C or Rust), ran it with a
snapshot file, and installed your own local
Monad node.
Now we'll run the example program again, but this time it will print the
real-time events published by our local Monad node.
Running with live data​
Step 1: preparing the Monad node​
Before running, make sure the execution daemon is running and that
execution events are enabled.
in particular, make sure you have passed the command line argument
--exec-event-ring to the execution daemon
Step 2: run the example program​
In the snapshot example, we passed the name of the snapshot file to the
program as a command line argument. In both the C and Rust example programs,
if we do not pass any filename at all, it will use default filename used by
the execution daemon, connecting us to the live event stream.


For C, run eventwatch with no arguments


For Rust, run the command cargo run -- -d


You will see similar data to the snapshot case, but as it is being published
by execution. If you stop the execution daemon, the example program will
detect that the source of data is gone, and exit.
Next steps​
This completes the getting started guide! If you're interested in developing
your own real-time data processing software with the SDK, where should
you go from here?
Here is a recommended list of resources, in roughly the order that will be
most helpful in developing real applications:


If you haven't already, read the overview and the
source code for the example program you just ran


Once you understand the basic ideas in the example,
the rest of the SDK documentation
should be easy to follow


Before using the SDK, make sure you understand the
consensus events and what they
mean


Try out a more sophisticated program and look at the source code for it


For Rust, try the "Block Explorer" TUI example in the upstream
monad-bft repository.
You can run it with cargo run -p monad-exec-events --example explorer
and then browse the source code in explorer.rs


For C, look at the code for the eventcap program in the upstream
monad
repository; this program is the "tcpdump" of the execution event system,
and shows several different uses of the API. You may also want to read
the next section about compiling the eventcap program




Optional: build the eventcap program​
eventcap is a useful utility for working with the event system. Like the Rust
eventwatch example, eventcap can decode execution event payloads into
human-readable form. It does several other tasks which are useful in the
developer workflow, e.g., recording captures of events and creating snapshot
event ring files for test cases.
warningeventcap requires gcc 15.2 or higher, and will not build with gcc 15.1.
The only Ubuntu release that ships with gcc 15.2 in its package repositories
is Ubuntu 25.10, which was recently released at the time this guide was written.If your Linux distribution does not provide gcc 15.2 and you do not want to
install it manually, you can instead use clang-19 (or more recent) but using
libc++ instead of libstdc++. The default on Linux is for clang to use the gcc
C++ standard library (libstdc++).If you specify -stdlib=libc++ it will use the LLVM standard library instead,
which has the needed <format> support. You may have to install it, since in
some distributions it is not part of the clang package. In Ubuntu, the clang-19
libc++ runtime and development packages will be added when you install
libc++-19-dev.When using libc++-19, you must also specify the -fexperimental-library
compiler flag to enable C++20 time zone support in <chrono>; eventcap uses
this for printing the event timestamp in local time. In some future version of
libc++ this will no longer be needed.
To build eventcap, you will also need the
CLI11
C++ command-line parser library and the OpenSSL development files. Although it
is optional, you should also install the development files for
GNU multiple-precision library
so that uint256 values print in decimal form.
The instructions also use the
ninja
build tool. You can install everything on Ubuntu with:
$ sudo apt install libcli11-dev libssl-dev libgmp-dev ninja-build
Now clone the
execution repository and
check out the branch release/exec-events-sdk-v1.0, then build the CMake
project rooted at cmd/eventcap.
Using clang-19 with libc++ and the above options:
$ git clone -b release/exec-events-sdk-v1.0 https://github.com/category-labs/monad.git \  ~/src/monad-eventcap$ CC=clang-19 CFLAGS="-march=x86-64-v4" \  CXX=clang++-19 CXXFLAGS="-stdlib=libc++ -fexperimental-library -march=x86-64-v4" cmake \  -S ~/src/monad-eventcap/cmd/eventcap -B ~/build/monad-eventcap-release -G Ninja \  -DCMAKE_BUILD_TYPE=RelWithDebInfo$ cmake --build ~/build/monad-eventcap-release
You should now be able to run:
$ ~/build/monad-eventcap-release/eventcap --help
noteThe -march=x86-64-v4 is needed to enable certain atomic operations at the
CPU instruction level, to avoid needing to link with libatomic.a; without this,
a performance warning is emitted, which becomes a compilation error due to
-Werror
To simplify running cmake with all these settings, you might want to create a
CMake toolchain file instead of using environment variables. To do this, create
a file called clang19-libcxx.cmake with these contents:
set(CMAKE_C_COMPILER clang-19)set(CMAKE_CXX_COMPILER clang++-19)set(CMAKE_ASM_FLAGS_INIT -march=x86-64-v4)set(CMAKE_C_FLAGS_INIT -march=x86-64-v4)set(CMAKE_CXX_FLAGS_INIT "-march=x86-64-v4 -stdlib=libc++ -fexperimental-library")
Now can you run this slightly cleaner command:
$ cmake --toolchain <path-to-toolchain-file> -S ~/src/monad-eventcap/cmd/eventcap \  -B ~/build/monad-eventcap-release -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo

## Code Examples

```prism
$ sudo apt install libcli11-dev libssl-dev libgmp-dev ninja-build
```

```prism
$ git clone -b release/exec-events-sdk-v1.0 https://github.com/category-labs/monad.git \  ~/src/monad-eventcap$ CC=clang-19 CFLAGS="-march=x86-64-v4" \  CXX=clang++-19 CXXFLAGS="-stdlib=libc++ -fexperimental-library -march=x86-64-v4" cmake \  -S ~/src/monad-eventcap/cmd/eventcap -B ~/build/monad-eventcap-release -G Ninja \  -DCMAKE_BUILD_TYPE=RelWithDebInfo$ cmake --build ~/build/monad-eventcap-release
```

```prism
$ ~/build/monad-eventcap-release/eventcap --help
```

```prism
set(CMAKE_C_COMPILER clang-19)set(CMAKE_CXX_COMPILER clang++-19)set(CMAKE_ASM_FLAGS_INIT -march=x86-64-v4)set(CMAKE_C_FLAGS_INIT -march=x86-64-v4)set(CMAKE_CXX_FLAGS_INIT "-march=x86-64-v4 -stdlib=libc++ -fexperimental-library")
```

```prism
$ cmake --toolchain <path-to-toolchain-file> -S ~/src/monad-eventcap/cmd/eventcap \  -B ~/build/monad-eventcap-release -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo
```

