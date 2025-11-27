# Pipelining

> Source: https://docs.monad.xyz/monad-arch/concepts/pipelining

## Documentation

Pipelining is a technique for implementing parallelism by dividing tasks into a series of smaller tasks which can be processed in parallel.
Pipelining is used in computer processors to increase the throughput of executing a series of instructions sequentially at the same clock rate. (There are other techniques used in processors to increase throughput as well.)  More about instruction-level parallelism (ILP) can be read here.
A simple example of pipelining:
Pipelining laundry day. Top: Naive; Bottom: Pipelined. Credit: Prof. Lois Hawkes, FSU
When doing four loads of laundry, the naive strategy is to wash, dry, fold, and store the first load of laundry before starting on the second one.  The pipelined strategy is to start washing load 2 when load 1 goes into the dryer.  Pipelining gets work done more efficiently by utilizing multiple resources simultaneously.

