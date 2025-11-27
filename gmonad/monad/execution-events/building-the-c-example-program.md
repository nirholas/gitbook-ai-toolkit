# Building the C example program

> Source: https://docs.monad.xyz/execution-events/getting-started/c

## Documentation

On this page

The C and C++ languages do not have a standard package manager, so using a
third-party library requires the programmer to come up with their own
dependency management scheme.
Before we perform the first step of the guide, we'll discuss the options the
user has for integrating the SDK library dependency into their project. Then
we'll pick one of these options and build the example program using that
method. A second method will be briefly shown at the end.
infoIf you are not familiar with CMake, you may want to read CMake's
"Using Dependencies Guide"
first
Where is the SDK source code?​
The execution event C SDK lives in the same source code repository as the
execution daemon (here), in the
subdirectory category/event.
It has a separate CMakeLists.txt file that can act as a top-level project
file, so that users do not need to build the full execution project in order
to compile it.
The SDK's build system produces a library called libmonad_event.a, or
libmonad_event.so if you prefer shared libraries. You will also need the
public header files.
How can my code use libmonad_event.a?​
Here are three different options:

Precompiled library - you could build the library yourself and store
the library file (and its headers) somewhere, then import it into your
build system manually. The SDK build system also creates a CMake "config"
file for use with
find_package
to help import it, if you are also using CMake

The other two options assume your project is also using CMake:


CMake subproject integration - your CMake project can include the SDK
as a subproject. In this case, you download the source code of the execution
repository as part of your own project, and call the CMake function:
add_subdirectory(<path-to-monad-repo>/category/event)
This will add the SDK's library target (called monad_event) into your
parent CMake project. One way to add the SDK code to your build is to use a
git submodule.
Another way is to use CMake's
FetchContent
module. The three main differences between these approaches are:

By default, FetchContent will clone a git repository into your CMake
build tree at build configuration time, whereas a git submodule
integrates into your source tree at the repository level
With FetchContent, the version you check out is specified by the
GIT_TAG you specify in a CMakeLists.txt file; for git submodule,
it is managed via git commands
If the content you are fetching has its own CMake buildsystem (as the
C SDK does), FetchContent will automatically call add_subdirectory
to add it to the current project; in the git submodule approach, you
need to do this manually



CMake ExternalProject integration - CMake's
ExternalProject
module is similar to FetchContent, but is more isolated; this will build
and install the SDK into a "staging" directory somewhere in your CMake build
tree. This uses a completely separate CMake invocation, so it will not add
the SDK's CMake project into your own. This means, for example, that you will
not automatically have a monad_event library target in your own CMake
project -- you would need to create one as an imported target.
ExternalProject helps isolate your build system from the SDK's build
system, ensuring that CMake configuration and variables from the SDK can't
"leak" into your parent project


In this guide, we'll use the FetchContent approach. This encapsulates the
entire process as a simple, all-in-one CMakeLists.txt file, and we comment
that file to explain everything you need to know.
This is the clear best choice for our tiny "Getting started" example program,
but it might not be best for your real project. At the end of this guide, an
alternative method using find_package is briefly shown.
Building the example program with FetchContent​
Step 1: install prerequisite development packages​
In addition to CMake (at least version 3.23) and git, we will need a recent C
compiler and two third-party libraries. We will also use
curl
to download some files.
Required C compiler​
The C SDK uses some recent features from C23, and requires either gcc-13 or
clang-19. If the default compiler found by CMake is too old, you will need
to specify an alternative C compiler by setting the CC environment variable
or using a CMake toolchain file.
The default compiler chosen by CMake is usually the one reported by the output
of the command cc -v. If you need to use a different one, you can use the
bash syntax VAR=VALUE <command> for setting an environment variable in the
scope of the following command, e.g.:
$ CC=gcc-15 cmake <args>
Required C++ compiler​
C++ is not used in this example, but there are some optional C++ components in
the CMake project. Consequently, you must have a C++ compiler installed or the
CMake configuration step will fail.
C++ in the SDKThe SDK is written in pure C, except for some C++ header files that can be used
to "pretty-print" event types using the <format> library. These are not part
of the example program, and they require full C++23 support for formatting
ranges  (the __cpp_lib_format_ranges feature test macro) which added to
libstdc++ in gcc version 15.2. This was very recently released: the first
time gcc 15.2 appeared in the Ubuntu package repositories was in Ubuntu 25.10.You can also use clang with libc++, the LLVM implementation of the C++ standard
library, which has had range formatting support since version 19. An example of
building a C++ program with clang-19 is shown as the optional last step of the
"Getting started" guide, when we build the eventcap utility.
Required third-party libraries​
RequirementUbuntu package nameWhat is it used for?zstd librarylibzstd-devSnapshot event ring files are compressed with zstd; libzstd is needed to decompress themlibhugetlbfslibhugetlbfs-devlibhugetlbfs is used to locate the optimal hugetlbfs mount point to create event ring shared memory files
libzstd is a hard requirement; libhugetlbfs is optional but is expected
by default on Linux. It can be turned off manually by setting the CMake option
MONAD_EVENT_USE_LIBHUGETLBFS to OFF.
macOS compatiblityAlthough real-time data requires a Linux host (because the execution daemon
itself does), you can compile and run the example on historical snapshot data
using macOS.In this case, you do not need libhugetlbfs (which is a Linux-only library),
but you will need libzstd, CMake, and at least clang-19. The former two
are not included in the default development tools, and the default system
compiler in any recently-released macOS version too old, so you'll probably
want to use
Homebrew or
MacPorts to
get these onto your system.
Step 2: download the example program​
First, create a new directory and download the example program source file
into it. We'll use the example directory ~/src/event-sdk-example-c
$ mkdir -p ~/src/event-sdk-example-c$ cd ~/src/event-sdk-example-c$ curl -O https://raw.githubusercontent.com/category-labs/monad/refs/tags/release/exec-events-sdk-v1.0/category/event/example/eventwatch.c
You should now have a file called eventwatch.c in your new directory.
Step 3: add a CMakeLists.txt build file​
Create a CMakeLists.txt file in the directory alongside eventwatch.c and
copy these contents into it:
cmake_minimum_required(VERSION 3.23)
project(eventwatch LANGUAGES C)
## SDK setup#
include(FetchContent)
FetchContent_Declare(exec_events_c_sdk    # The execution events C SDK is kept in the same git repository as the    # execution daemon itself    GIT_REPOSITORY https://github.com/category-labs/monad.git
    # The latest version of the SDK is available on a special release branch    # of the execution repository    GIT_TAG release/exec-events-sdk-v1.0
    # This will only download the SDK branch    GIT_SHALLOW TRUE
    # This will disable the checkout of all git submodules; they are needed    # for the full execution daemon to build, but not the SDK    GIT_SUBMODULES ""
    # The top-level CMakeLists.txt builds the entire execution daemon; we don't    # want that, so we specify SOURCE_SUBDIR to choose a CMakeLists.txt file    # in a sudirectory to treat as the "top-level" file for the external    # project; this only creates the monad_event library    SOURCE_SUBDIR category/event)
# The SDK's build system also builds the same example we're building now, using# the same target name ('eventwatch'). This is done as a CI check to ensure# that the upstream project doesn't break the example program. We have to# disable it, because it will conflict with the eventwatch target we're going# to add below (CMake does not allow two targets with the same name)set(MONAD_EVENT_BUILD_EXAMPLE OFF CACHE INTERNAL "")
# This will download the source code and call add_subdirectory, which will add# the `monad_event` library target; this is the SDK target we need to linkFetchContent_MakeAvailable(exec_events_c_sdk)
## eventwatch example program target#
add_executable(eventwatch eventwatch.c)target_compile_options(eventwatch PRIVATE -Wall -Wextra -Wconversion -Werror)target_link_libraries(eventwatch PRIVATE monad_event)
Step 4: run CMake and build​
CMake with make and the default compiler:​
$ cmake -S ~/src/event-sdk-example-c -B ~/src/event-sdk-example-c/build$ cd ~/src/event-sdk-example-c/build$ make
CMake with ninja and an alternate compiler:​
Here is another possible invocation, which sets an alternative C compiler using
the CC environment variable and uses the Ninja
build tool:
$ CC=clang-19 cmake -S ~/src/event-sdk-example-c -B ~/src/event-sdk-example-c/build -G Ninja$ cd ~/src/event-sdk-example-c/build$ ninja
The compilation should produce an executable file called eventwatch. Try
running it with the -h flag to print the help.
$ ./eventwatch -husage: eventwatch [-h] [<exec-event-ring>]
execution event observer example program
Options:  -h | --help   print this message
Positional arguments:  <exec-event-ring>   path of execution event ring shared memory file                        [default: monad-exec-events]
If all was successful, continue on to the next step in the guide
or if you are also interested in Rust, build the
Rust example program. The Rust example program prints more
interesting output than the C version, thanks to Rust's
#[derive(Debug)]
attribute, so the "Getting started" experience is better in Rust. You can do
an equivalent thing in C++ by using the aformentioned std::formatter
specializations, but they're not in the tutorial.
You can also continue on to the next section on this page, which shows a
different way of integrating with the C library.
Alternative: install locally, find with find_package​
Now that you have seen the "all-in-one" tutorial, which explains the source
code organization, where the SDK's CMakeLists.txt file is, etc., it is
easy to show an alternative kind of build system without as much commentary.
In this section we will:


Install the SDK to the temporary directory /tmp/sdk-install-demo, which
will have the traditional include and lib directory structure, but
also a lib/cmake/category-labs directory containing the config files for
CMake's find_package


Compile eventwatch.c again, this time using find_package which will be
instructed to look in /tmp/sdk-install-demo


Step 1: build and install libmonad_event.a​
$ git clone -b release/exec-events-sdk-v1.0 https://github.com/category-labs/monad.git \  ~/src/monad-exec-events-sdk$ cmake -S ~/src/monad-exec-events-sdk/category/event \  -B ~/build/monad-exec-events-sdk-v1-release \  -DCMAKE_INSTALL_PREFIX=/tmp/sdk-install-demo -DCMAKE_BUILD_TYPE=RelWithDebInfo$ cmake --build ~/build/monad-exec-events-sdk-v1-release$ cmake --install ~/build/monad-exec-events-sdk-v1-release
If all is successful, you should have a populated /tmp/sdk-install-demo
directory.
Step 2: create a new directory and download eventwatch.c​
$ mkdir -p ~/src/event-sdk-example-c-find-package$ cd ~/src/event-sdk-example-c-find-package$ curl -O https://raw.githubusercontent.com/category-labs/monad/refs/tags/release/exec-events-sdk-v1.0/category/event/example/eventwatch.c
Step 3: create CMakeLists.txt​
Add a CMakeLists.txt file with this content:
cmake_minimum_required(VERSION 3.23)
project(eventwatch LANGUAGES C)
find_package(monad_exec_events_sdk REQUIRED             PATHS /tmp/sdk-install-demo/lib/cmake/category-labs)
add_executable(eventwatch eventwatch.c)target_compile_options(eventwatch PRIVATE -Wall -Wextra -Wconversion -Werror)target_link_libraries(eventwatch PRIVATE monad_event)
Step 4: build and run​
$ cmake -S . -B build$ cmake --build build$ build/eventwatch -h

## Code Examples

```prism
add_subdirectory(<path-to-monad-repo>/category/event)
```

```prism
$ CC=gcc-15 cmake <args>
```

```prism
$ mkdir -p ~/src/event-sdk-example-c$ cd ~/src/event-sdk-example-c$ curl -O https://raw.githubusercontent.com/category-labs/monad/refs/tags/release/exec-events-sdk-v1.0/category/event/example/eventwatch.c
```

```prism
cmake_minimum_required(VERSION 3.23)
project(eventwatch LANGUAGES C)
## SDK setup#
include(FetchContent)
FetchContent_Declare(exec_events_c_sdk    # The execution events C SDK is kept in the same git repository as the    # execution daemon itself    GIT_REPOSITORY https://github.com/category-labs/monad.git
    # The latest version of the SDK is available on a special release branch    # of the execution repository    GIT_TAG release/exec-events-sdk-v1.0
    # This will only download the SDK branch    GIT_SHALLOW TRUE
    # This will disable the checkout of all git submodules; they are needed    # for the full execution daemon to build, but not the SDK    GIT_SUBMODULES ""
    # The top-level CMakeLists.txt builds the entire execution daemon; we don't    # want that, so we specify SOURCE_SUBDIR to choose a CMakeLists.txt file    # in a sudirectory to treat as the "top-level" file for the external    # project; this only creates the monad_event library    SOURCE_SUBDIR category/event)
# The SDK's build system also builds the same example we're building now, using# the same target name ('eventwatch'). This is done as a CI check to ensure# that the upstream project doesn't break the example program. We have to# disable it, because it will conflict with the eventwatch target we're going# to add below (CMake does not allow two targets with the same name)set(MONAD_EVENT_BUILD_EXAMPLE OFF CACHE INTERNAL "")
# This will download the source code and call add_subdirectory, which will add# the `monad_event` library target; this is the SDK target we need to linkFetchContent_MakeAvailable(exec_events_c_sdk)
## eventwatch example program target#
add_executable(eventwatch eventwatch.c)target_compile_options(eventwatch PRIVATE -Wall -Wextra -Wconversion -Werror)target_link_libraries(eventwatch PRIVATE monad_event)
```

```prism
$ cmake -S ~/src/event-sdk-example-c -B ~/src/event-sdk-example-c/build$ cd ~/src/event-sdk-example-c/build$ make
```

```prism
$ CC=clang-19 cmake -S ~/src/event-sdk-example-c -B ~/src/event-sdk-example-c/build -G Ninja$ cd ~/src/event-sdk-example-c/build$ ninja
```

```prism
$ ./eventwatch -husage: eventwatch [-h] [<exec-event-ring>]
execution event observer example program
Options:  -h | --help   print this message
Positional arguments:  <exec-event-ring>   path of execution event ring shared memory file                        [default: monad-exec-events]
```

```prism
$ git clone -b release/exec-events-sdk-v1.0 https://github.com/category-labs/monad.git \  ~/src/monad-exec-events-sdk$ cmake -S ~/src/monad-exec-events-sdk/category/event \  -B ~/build/monad-exec-events-sdk-v1-release \  -DCMAKE_INSTALL_PREFIX=/tmp/sdk-install-demo -DCMAKE_BUILD_TYPE=RelWithDebInfo$ cmake --build ~/build/monad-exec-events-sdk-v1-release$ cmake --install ~/build/monad-exec-events-sdk-v1-release
```

```prism
$ mkdir -p ~/src/event-sdk-example-c-find-package$ cd ~/src/event-sdk-example-c-find-package$ curl -O https://raw.githubusercontent.com/category-labs/monad/refs/tags/release/exec-events-sdk-v1.0/category/event/example/eventwatch.c
```

```prism
cmake_minimum_required(VERSION 3.23)
project(eventwatch LANGUAGES C)
find_package(monad_exec_events_sdk REQUIRED             PATHS /tmp/sdk-install-demo/lib/cmake/category-labs)
add_executable(eventwatch eventwatch.c)target_compile_options(eventwatch PRIVATE -Wall -Wextra -Wconversion -Werror)target_link_libraries(eventwatch PRIVATE monad_event)
```

```prism
$ cmake -S . -B build$ cmake --build build$ build/eventwatch -h
```

