# Hardware Requirements

> Source: https://docs.monad.xyz/node-ops/hardware-requirements

## Documentation

On this page

warningCloud-based environments are not officially supported.
Requirements​
All requirements are the same between validators (consensus participants) and full nodes
aside from bandwidth:

CPU: 16 core CPU with 4.5 GHz+ base clock speed, e.g. AMD Ryzen 9950x, AMD Ryzen 7950x,
AMD EPYC 4584PX, etc.
Memory: 32 GB+ RAM
Storage:

2TB dedicated disk for TrieDB (Execution)
500GB Disk for MonadBFT / OS
PCIe Gen4x4 NVME SSD or better for both


Bandwidth:

300 Mbit/s (Validators)
100 Mbit/s (Full Nodes)



warningHard drive performance can vary dramatically by manufacturer. Below are results from internal testing:Ranked performance
Samsung 980 / 990 Pro - PCIe 4.0, top class performance
Samsung PM9A1 - PCIe 4.0, pretty good performance and stable performance under load
Micron 7450 - PCIe 4.0, pretty good performance BUT has weird random slowdowns under a lot of load
Known unreliable
Nextorage SSDs - can become unresponsive under load due to overheating, requiring a system reboot.

A community-driven set of hardware recommendations and notes can be found here.
Why Bare Metal?​
Monad nodes must operate on bare metal servers rather than virtualized or cloud-based environments (e.g., AWS EC2, GCP, Azure) due to the system's strict performance and timing requirements.
A bare metal server gives the node direct, stable access to hardware, ensuring smooth operation and synchronization with the network:


Monad’s consensus protocol enforces tight time windows—blocks are proposed and voted on in sub-second intervals, and the network assumes nodes can validate and execute blocks within this budget. In such a situation, cloud-based environments may introduce latency and unpredictability, which can cause nodes to miss deadlines, fall behind in block processing, or become unstable during high-throughput periods.


Even when resources appear sufficient on paper, virtualization adds an additional layer of software between the node and physical hardware. This layer introduces context switching overhead and restricts direct I/O access to SSDs and network interfaces. These effects are negligible for average compute tasks but become significant when sustained high-throughput and low-latency operations are required, as in Monad’s consensus and execution loops.


In summary, a bare metal server provides predictability and determinism, which are crucial for maintaining synchronization and throughput across the network. Cloud-hosted VMs may work under light loads, but they cannot guarantee consistent real-time performance required by Monad consensus at scale.

