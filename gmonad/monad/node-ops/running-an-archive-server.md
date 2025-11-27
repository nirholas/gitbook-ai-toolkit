# Running an Archive Server

> Source: https://docs.monad.xyz/node-ops/archive-data/running-an-archive-server

## Documentation

On this page

Please see The Data Waterfall for an overview
of the different sources of archive data. This page is dedicated to operational details on
running an Archive Server.
Recommended footprint​
For anyone looking to reliably serve historical transactional data, it is recommended to run
multiple Archive Servers, fed by multiple full nodes running the Archive Writer process.
Suggested configuration:

2 Archive Servers running MongoDB + monad-indexer
2 Archive Writer nodes, aka full node + monad-archiver
Many full nodes serving RPC requests, connected to both Archive Servers for historical
transactional data

Recommended Archive Server host specs​

CPU: 16 cores
RAM: minimum 64GB; prefer >512GB for best performance
Storage: minimum recommended 16TB; preferred 32TB+

NVMe SSD
RAID 10
Minimum 10K IOPS sustained


Network: >1GbE, scale higher as needed when serving more RPC servers

Fresh installation​
These instructions assume an existing full node (for Archive Writer) and a new host (for Archive
Server).
On your Archive Server:​


Add the following section to your ~/.env
# Replace <db username> and <db pwd> with your actual valuesDB_USER="<your db username>"DB_PWD="<your db pwd>"DB_VOLUME="~/archive-db-data"
# Note: source and sink should generally be the same local MongoDB.# Indexer reads from:BLOCK_DATA_SOURCE="mongodb mongodb://${DB_USER}:${DB_PWD}@0.0.0.0:27017 archive-db"# Indexer writes to:ARCHIVE_SINK="mongodb mongodb://${DB_USER}:${DB_PWD}@0.0.0.0:27017 archive-db"OTEL_ENDPOINT="http://0.0.0.0:4317"


Run mongodb. Instructions show how to run in Docker, but operators can run however they choose.
archive-db:  image: mongo:latest  command: mongod --bind_ip 0.0.0.0  networks:    - host  environment:    MONGO_INITDB_ROOT_USERNAME: ${DB_USER}    MONGO_INITDB_ROOT_PASSWORD: ${DB_PWD}  ports:    - "27017:27017"  volumes:    - ${DB_VOLUME}:/data/db  logging:    driver: journald    options:      tag: "mongo"


Start the db
# create directory from .env db volumesource ~/.envsudo mkdir -p $DB_VOLUMEsudo chown -R monad:monad $DB_VOLUMEsudo chmod 700 $DB_VOLUME
docker compose up archive-db -d


On your Archive Writer host:​


Add the following section to your ~/.env
################################################################################## Vars that do not change ################################################################################### Replace with your Archive Server credentialsARCHIVE_DB_USER="<your db username>"ARCHIVE_DB_PWD="<your db pwd>"ARCHIVE_DB_HOST="<your db hostname>"
## Where block data gets written (your Archive Server)ARCHIVE_SINK="mongodb mongodb://${ARCHIVE_DB_USER}:${ARCHIVE_DB_PWD}@${ARCHIVE_DB_HOST}:27017 archive-db"## Change this if your ledger folder is in a different locationBFT_BLOCK_PATH=~/monad-bft/ledgerOTEL_ENDPOINT=http://0.0.0.0:4317## This can be significantly higher during backfillMAX_CONCURRENT_BLOCKS=50

###################################################################### Backfill from Genesis (initial configuration) ########################################################################BLOCK_DATA_SOURCE="aws testnet-ltu-032-0 50" # testnetBLOCK_DATA_SOURCE="aws mainnet-deu-010-0 50" # mainnet## Alternatively you can use your other ArchiveDB if it has already been backfilled## If using another Archive Server, define variables for it and use them:#OTHER_DB_USER="<other db username>"#OTHER_DB_PWD="<other db pwd>"#OTHER_DB_HOST="<other db hostname>"#BLOCK_DATA_SOURCE="mongodb mongodb://${OTHER_DB_USER}:${OTHER_DB_PWD}@${OTHER_DB_HOST}:27017 archive-db"FALLBACK_BLOCK_DATA_SOURCE="aws testnet-ltu-032-0 50" # testnetFALLBACK_BLOCK_DATA_SOURCE="aws mainnet-deu-010-0 50" # mainnet
##################################################################################### Normal Operation ######################################################################################## Archiver checks triedb first for block dataBLOCK_DATA_SOURCE="triedb /dev/triedb 5000"
### FALLBACK_BLOCK_DATA_SOURCE ##### This is used whenever data is missing from BLOCK_DATA_SOURCE## Normally used after state-sync## If you have another Archive Server for redundancy, configure it here:#OTHER_DB_USER="<other db username>"#OTHER_DB_PWD="<other db pwd>"#OTHER_DB_HOST="<other db hostname>"#FALLBACK_BLOCK_DATA_SOURCE="mongodb mongodb://${OTHER_DB_USER}:${OTHER_DB_PWD}@${OTHER_DB_HOST}:27017 archive-db"
## Alternatively you can use category-labs aws bucket## Note: YOU pay for S3 egress costs if pulling from this bucketFALLBACK_BLOCK_DATA_SOURCE="aws testnet-ltu-032-0 50" # testnetFALLBACK_BLOCK_DATA_SOURCE="aws mainnet-deu-010-0 50" # mainnet


Backfilling:
sudo systemctl start monad-archiver# Should show it running# Double check the arguments look correct based on the above ^systemctl status monad-archiver# Expect many:# > INFO: Successfully archived block block_num=Xjournalctl -u monad-archiver -o cat


Once monad-archiver has caught up to the chain tip you will see:

INFO: Nothing to process



This means backfilling is done and you should

Comment out BACKFILL section in your .env and uncomment Normal Operation
Restart: systemctl restart monad-archiver
Verify status and logs as above



On your ArchiveDB host​


Start monad-indexer
sudo systemctl start monad-indexersystemctl status monad-indexer# Expect many:# > INFO: Indexing block...# > INFO: Index spot-check successfuljournalctl -u monad-indexer -o cat


[Optional] Set up monad-archive-checker​
Typically only 1 checker is run per organization, but more can be run if desired


Add the following systemd override to monad-archive-checker
sudo systemctl edit monad-archive-checker
[Service]ExecStart=ExecStart=/usr/local/bin/monad-archive-checker \    # Example --bucket my-org-mainnet-checker    # Note: storing checker state in local mongo or filesystem    #       will be supported in a future release    --bucket <S3 Bucket for storing checker state>    checker    # Example of comparing a local self-hosted mongo against a Category Labs aws bucket    # --init-replicas "<aws mainnet-deu-009-0 50,mongodb mongodb://<username>:<pwd>@<db hostname>:27017 archive-db>,mongodb mongodb://<username>:<pwd>@<second db hostname>:27017 archive-db>"    --init-replicas "<ArchiveDB 1>,<ArchiveDB 2>"


Reload and Restart
sudo systemctl daemon-reloadsudo systemctl restart monad-archive-checkersystemctl status monad-archive-checker
# Check for errorsjournalctl -u monad-archive-checker -o cat -f

## Code Examples

```prism
# Replace <db username> and <db pwd> with your actual valuesDB_USER="<your db username>"DB_PWD="<your db pwd>"DB_VOLUME="~/archive-db-data"
# Note: source and sink should generally be the same local MongoDB.# Indexer reads from:BLOCK_DATA_SOURCE="mongodb mongodb://${DB_USER}:${DB_PWD}@0.0.0.0:27017 archive-db"# Indexer writes to:ARCHIVE_SINK="mongodb mongodb://${DB_USER}:${DB_PWD}@0.0.0.0:27017 archive-db"OTEL_ENDPOINT="http://0.0.0.0:4317"
```

```prism
archive-db:  image: mongo:latest  command: mongod --bind_ip 0.0.0.0  networks:    - host  environment:    MONGO_INITDB_ROOT_USERNAME: ${DB_USER}    MONGO_INITDB_ROOT_PASSWORD: ${DB_PWD}  ports:    - "27017:27017"  volumes:    - ${DB_VOLUME}:/data/db  logging:    driver: journald    options:      tag: "mongo"
```

```prism
# create directory from .env db volumesource ~/.envsudo mkdir -p $DB_VOLUMEsudo chown -R monad:monad $DB_VOLUMEsudo chmod 700 $DB_VOLUME
docker compose up archive-db -d
```

```prism
################################################################################## Vars that do not change ################################################################################### Replace with your Archive Server credentialsARCHIVE_DB_USER="<your db username>"ARCHIVE_DB_PWD="<your db pwd>"ARCHIVE_DB_HOST="<your db hostname>"
## Where block data gets written (your Archive Server)ARCHIVE_SINK="mongodb mongodb://${ARCHIVE_DB_USER}:${ARCHIVE_DB_PWD}@${ARCHIVE_DB_HOST}:27017 archive-db"## Change this if your ledger folder is in a different locationBFT_BLOCK_PATH=~/monad-bft/ledgerOTEL_ENDPOINT=http://0.0.0.0:4317## This can be significantly higher during backfillMAX_CONCURRENT_BLOCKS=50

###################################################################### Backfill from Genesis (initial configuration) ########################################################################BLOCK_DATA_SOURCE="aws testnet-ltu-032-0 50" # testnetBLOCK_DATA_SOURCE="aws mainnet-deu-010-0 50" # mainnet## Alternatively you can use your other ArchiveDB if it has already been backfilled## If using another Archive Server, define variables for it and use them:#OTHER_DB_USER="<other db username>"#OTHER_DB_PWD="<other db pwd>"#OTHER_DB_HOST="<other db hostname>"#BLOCK_DATA_SOURCE="mongodb mongodb://${OTHER_DB_USER}:${OTHER_DB_PWD}@${OTHER_DB_HOST}:27017 archive-db"FALLBACK_BLOCK_DATA_SOURCE="aws testnet-ltu-032-0 50" # testnetFALLBACK_BLOCK_DATA_SOURCE="aws mainnet-deu-010-0 50" # mainnet
##################################################################################### Normal Operation ######################################################################################## Archiver checks triedb first for block dataBLOCK_DATA_SOURCE="triedb /dev/triedb 5000"
### FALLBACK_BLOCK_DATA_SOURCE ##### This is used whenever data is missing from BLOCK_DATA_SOURCE## Normally used after state-sync## If you have another Archive Server for redundancy, configure it here:#OTHER_DB_USER="<other db username>"#OTHER_DB_PWD="<other db pwd>"#OTHER_DB_HOST="<other db hostname>"#FALLBACK_BLOCK_DATA_SOURCE="mongodb mongodb://${OTHER_DB_USER}:${OTHER_DB_PWD}@${OTHER_DB_HOST}:27017 archive-db"
## Alternatively you can use category-labs aws bucket## Note: YOU pay for S3 egress costs if pulling from this bucketFALLBACK_BLOCK_DATA_SOURCE="aws testnet-ltu-032-0 50" # testnetFALLBACK_BLOCK_DATA_SOURCE="aws mainnet-deu-010-0 50" # mainnet
```

```prism
sudo systemctl start monad-archiver# Should show it running# Double check the arguments look correct based on the above ^systemctl status monad-archiver# Expect many:# > INFO: Successfully archived block block_num=Xjournalctl -u monad-archiver -o cat
```

```prism
sudo systemctl start monad-indexersystemctl status monad-indexer# Expect many:# > INFO: Indexing block...# > INFO: Index spot-check successfuljournalctl -u monad-indexer -o cat
```

```prism
sudo systemctl edit monad-archive-checker
```

```prism
[Service]ExecStart=ExecStart=/usr/local/bin/monad-archive-checker \    # Example --bucket my-org-mainnet-checker    # Note: storing checker state in local mongo or filesystem    #       will be supported in a future release    --bucket <S3 Bucket for storing checker state>    checker    # Example of comparing a local self-hosted mongo against a Category Labs aws bucket    # --init-replicas "<aws mainnet-deu-009-0 50,mongodb mongodb://<username>:<pwd>@<db hostname>:27017 archive-db>,mongodb mongodb://<username>:<pwd>@<second db hostname>:27017 archive-db>"    --init-replicas "<ArchiveDB 1>,<ArchiveDB 2>"
```

```prism
sudo systemctl daemon-reloadsudo systemctl restart monad-archive-checkersystemctl status monad-archive-checker
# Check for errorsjournalctl -u monad-archive-checker -o cat -f
```

