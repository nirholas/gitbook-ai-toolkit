# Building the Rust example program

> Source: https://docs.monad.xyz/execution-events/getting-started/rust

## Documentation

On this page

The execution event SDK is made up of two packages, called monad-event-ring
and monad-exec-events. These are described in more detail in the
Rust API guide,
but for now it's enough to just know their names.
In the future, Category Labs may publish these packages to
crates.io,
but that is not how the SDK is currently distributed.
Instead, the user's Cargo.toml file declares the upstream source of these
dependencies to be a particular release tag of the git repository where the
SDK source code is located. Dependencies which are sourced from git rather
than crates.io are explained in
this section
of the Cargo Book.
Where is the Rust SDK source code?​
The execution event Rust SDK lives in the monad-bft
git repository, the same repository as the consensus daemon and the JSON-RPC
server. Despite being the "execution events SDK," it does not live in
execution repository alongside the C SDK, for several reasons:


All the code in the execution repository is written in C and C++, whereas
everything in monad-bft is written in Rust


The execution (C++) repository is a dependency of the BFT (Rust) one. The
Rust project uses some C and C++ functionality (via extern "C" FFI APIs)
but the reverse is not true: C never calls Rust functions with C linkage.
For this reason, all the cross-language interop machinery is in the Rust
repository, and defining the Rust SDK in this repository keeps it that way


However, the C ecosystem still affects Rust: some of the functions in the
execution events C SDK are reused by Rust, via an FFI interface. The main
way this affects the Rust build is that you must ensure that a recent enough
C compiler is selected when CMake and bindgen are run from Cargo.
The C SDK uses some recent C23 language features, and requires either gcc-13 or
clang-19. If you run cc -v and it reports an older compiler, you will need to
set the CC environment variable to tell CMake to select a newer compiler.
Building the example program​
Step 1: install prerequisite development packages​
You might already have some of these installed, but make sure you have at least
the minimum required version (newer versions will probably work, but are not
explicitly tested).
In addition to a Rust toolchain, you will need:
RequirementUbuntu package nameMinimum versionWhat is it used for?C compilergcc-13 or clang-19see package namesThe core event library (libmonad_event.a) is written in C, and is used by the Rust libraryC++ compilerg++-13 or clang-19see package namesThe optional C++ components are not used by Rust, but the CMake configure step will report an error if it cannot find a C++ compilerCMakecmakeCMake 3.23libmonad_event.a is built with CMake, via build.rs integration with cargozstd librarylibzstd-devanySnapshot event ring files are compressed with zstd; this library is needed to decompress themlibhugetlbfslibhugetlbfs-devanylibhugetlbfs is used to locate the default hugetlbfs mount point that holds event ring shared memory fileslibclangclang-19clang-19Rust's bindgen requires the a recent version of the libclang library
We will also need git and curl.
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
To install all of these in one shot on Ubuntu 24.04 or higher, you can
run this command (feel free to use more recent verions, e.g., clang-20):
$ sudo apt install git curl gcc g++ cmake clang-19 libzstd-dev libhugetlbfs-dev
libclang and clang versionsEven if you compile libmonad_event.a with gcc, the Rust
bindgen utility still uses the
libclang tool to
programmatically generate Rust bindings to C code. Technically you should
not need the full clang compiler, just the libclang package, but some users
have reported trouble without installing it.The reason you need version 19 (or greater) is that clang-19 was the first
version to support enough features from the C23 language standard to be able
to compile the SDK. If you see errors that imply that bindgen cannot understand
the constexpr keyword, then bindgen has automatically selected a libclang
version that is too old.If you have multiple libclang versions on the system (the default clang is
version 18 on Ubuntu 24.04), installing a newer version may not help, if the
underlying problem is that bindgen is selecting the wrong one by default. This
is a common problem on macOS, where cargo wants to select the much older
libclang that is part of the standard macOS developer SDK. During the compile
step, we'll explain more about how to deal with this.
Step 2: create a new package and copy the example code into it​
First, create the new package:
$ cargo new --bin event-sdk-example-rust$ cd event-sdk-example-rust
Next, we'll overwrite the default "Hello world" main.rs source file with the
example program code, downloaded from github:
$ curl https://raw.githubusercontent.com/category-labs/monad-bft/refs/tags/release/exec-events-sdk-v1.0/monad-exec-events/examples/eventwatch.rs > src/main.rs
Step 3: integrating with the SDK packages​
Create the following Cargo.toml file:
[package]name = "event-sdk-example-rust"version = "0.1.0"edition = "2021"
[dependencies]chrono = "0.4.34"clap = { version = "4.2", features = ["derive"] }lazy_static = "1.5.0"zstd-sys = "2.0.16"
[dependencies.monad-exec-events]git = "https://github.com/category-labs/monad-bft"tag = "release/exec-events-sdk-v1.0"
[dependencies.monad-event-ring]git = "https://github.com/category-labs/monad-bft"tag = "release/exec-events-sdk-v1.0"
Step 4: build the project​
cargo build
The first time you build will be slow, because it will fetch the monad-bft
repository and all transitive git submodules. Almost none of them are needed
for the SDK, but cargo checks them out by default.
You may need to pass a more recent compiler to CMake, and you can do so using
bash's terse syntax for setting environment variables in the scope of command
to be run, for example:
CC=clang-19 cargo build
If you encounter errors...The most common source of errors when building is when bindgen selects an
outdated libclang version, as explained earlier. This typically appears
as either:
An error explicitly mentioning libclang OR
A message that includes the text "Unable to generate bindings"
Setting the environment variable CC=clang-19 only influences the compiler
that CMake uses to build the C SDK library, libmonad_event.a. Namely, it
does not the affect the libclang version that is used by bindgen to generate
the bindings.There are a number of environment variables that control the behavior of how
libclang is located and configured, and they're documented in the "Environment
Variables" section of
this page.Some advice we have found works well:

Setting LLVM_CONFIG_PATH to point to the full path to the llvm-config
binary is the best option; this command bakes in a lot of details about
how LLVM was built and installed on the system, to make it easier for
users of LLVM (such as bindgen) to find the configuration they need


In some unusual cases, you may select the right libclang but it may
be configured strangely, so that it cannot find the basic libc header
files anymore (typical culprits are claims that stddef.h, assert.h,
or string.h are missing); you can can figure out the location of these
files on the system and pass them as system include directories (the
-isystem clang option) to libclang through bindgen using the
BINDGEN_EXTRA_CLANG_ARGS environment variable; on macOS this looks like:
BINDGEN_EXTRA_CLANG_ARGS="-isystem $(xcrun --show-sdk-path)/usr/include"
or on Ubuntu 24.04 LTS:
BINDGEN_EXTRA_CLANG_ARGS="-isystem /usr/include"


After you have solved any issues, the compilation should produce an executable
file. Try running it with the -h flag to print the help:
cargo run -- -h
If all was successful, continue on to the next step in the guide.

## Code Examples

```prism
$ sudo apt install git curl gcc g++ cmake clang-19 libzstd-dev libhugetlbfs-dev
```

```prism
$ cargo new --bin event-sdk-example-rust$ cd event-sdk-example-rust
```

```prism
$ curl https://raw.githubusercontent.com/category-labs/monad-bft/refs/tags/release/exec-events-sdk-v1.0/monad-exec-events/examples/eventwatch.rs > src/main.rs
```

```prism
[package]name = "event-sdk-example-rust"version = "0.1.0"edition = "2021"
[dependencies]chrono = "0.4.34"clap = { version = "4.2", features = ["derive"] }lazy_static = "1.5.0"zstd-sys = "2.0.16"
[dependencies.monad-exec-events]git = "https://github.com/category-labs/monad-bft"tag = "release/exec-events-sdk-v1.0"
[dependencies.monad-event-ring]git = "https://github.com/category-labs/monad-bft"tag = "release/exec-events-sdk-v1.0"
```

```prism
cargo build
```

```prism
CC=clang-19 cargo build
```

```prism
BINDGEN_EXTRA_CLANG_ARGS="-isystem $(xcrun --show-sdk-path)/usr/include"
```

```prism
BINDGEN_EXTRA_CLANG_ARGS="-isystem /usr/include"
```

```prism
cargo run -- -h
```

