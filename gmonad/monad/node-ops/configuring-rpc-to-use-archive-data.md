# Configuring RPC to use archive data

> Source: https://docs.monad.xyz/node-ops/archive-data/configuring-rpc

## Documentation

On this page

This is not for validator nodesIntegration with the archive is designed for full nodes servicing RPC requests, not for validator
nodes.
Enabling call tracesEnabling --trace_calls is recommended for RPC nodes.
This preserves the detailed error information necessary for call traces, e.g. debug_traceTransaction.
To make this override, please run sudo systemctl edit monad-execution and add the --trace_calls CLI param
to the ExecStart definition (may need a line continuation character \):sudo systemctl edit monad-execution[Service]Type=simpleExecStart=ExecStart=/usr/local/bin/monad \    [... existing cli commands, see comment at the bottom of the systemctl editor ...]    --trace_calls
Configuring monad-rpc with Archive Server backup​


Configure an Archive Server that is geographically close to
this full node.


Add the following vars to your /home/monad/.env:
# Replace <db username>, <db pwd> and <db hostname> with your values from Step (1)MONGO_URL="mongodb://<db username>:<db pwd>@<db hostname>:27017"MONGO_DB_NAME="archive-db"DB_HOST=<db hostname>DB_PWD=<db pwd>DB_USERNAME=<db username>


Verify connectivity:
source /home/monad/.env
nc -vz $DB_HOST 27017mongosh "$MONGO_URL" --quiet --eval '    try {    db.adminCommand({ping: 1});    const archiveDb = db.getSiblingDB("archive-db");    const hasCollection = archiveDb.getCollectionNames().includes("block_level");    print(hasCollection ? "OK: Collection exists" : "FAIL: Collection missing");    quit(hasCollection ? 0 : 1);    } catch(e) {    print("FAIL: " + e.message);    quit(1);    }'


Add the following systemd override to monad-rpc:
sudo systemctl edit monad-rpc
[Service]ExecStart=ExecStart=/usr/local/bin/monad-rpc \    [... existing cli commands, see comment at the bottom of the systemctl editor ...]    --mongo-url ${MONGO_URL} \    --mongo-db-name ${MONGO_DB_NAME} \    --use-eth-get-logs-index


Reload and restart:
sudo systemctl daemon-reloadsudo systemctl restart monad-rpc


Check for an early block outside local retention:
curl -X POST -H "Content-Type: application/json" --data '{        "jsonrpc": "2.0",        "method": "eth_getBlockByNumber",        "params": ["0x1", false],        "id": 1    }'  http://localhost:8080


Configuring monad-rpc with AWS backup​


Ensure an AWS identity and credentials are on the box.

Run aws configure to setup your AWS credentials and config on the full node. This should
generate config and credentials files under ~/.aws/. See the
AWS CLI docs.
When running in systemd, AWS permissions need to be created under monad user. See the
general validator or fullnode docs for the broader instructions to run rpc, but ensure the
monad user has aws credentials with access to the bucket.



Create an AWS IAM policy using this user guide and the following sample json:
{    "Version": "2012-10-17",    "Statement": [        {            "Effect": "Allow",            "Action": [                "s3:GetObject",                "s3:ListBucket",                "s3:GetBucketRequestPayment",                "execute-api:Invoke"            ],            "Resource": [                "arn:aws:s3:::*/*",                "arn:aws:s3:::*",                "arn:aws:execute-api:*:*:*"            ],            "Condition": {                "StringEquals": {                    "aws:ResourceOrgID": "o-sq9ayub2wk"                }            }        }    ]}


To obtain a free-tier api-key, send an AWS Signature v4 signed request to https://9df09fanz1.execute-api.us-east-2.amazonaws.com/prod/free-tier-key


ex. using awscurl utility:
awscurl https://9df09fanz1.execute-api.us-east-2.amazonaws.com/prod/free-tier-key --region us-east-2




Add the following vars to your /home/monad/.env:
ARCHIVE_API_KEY=<key from step 3># Replace with appropriate mainnet, localnet or testnet bucket# Below is the public testnet bucket maintained by Category LabsARCHIVE_BUCKET="testnet-ltu-032-0"# Below is the public mainnet bucket maintained by Category LabsARCHIVE_BUCKET="mainnet-deu-010-0"


Add the following systemd override to monad-rpc:
sudo systemctl edit monad-rpc
[Service]ExecStart=ExecStart=/usr/local/bin/monad-rpc \    [... existing cli commands, see comment at the bottom of the systemctl editor ...]    --s3-bucket ${ARCHIVE_BUCKET} \    --region "us-east-2" \    --archive-url "https://9df09fanz1.execute-api.us-east-2.amazonaws.com/prod" \    --archive-api-key ${ARCHIVE_API_KEY}


Reload and restart:
sudo systemctl daemon-reloadsudo systemctl restart monad-rpc


Check for an early block outside local retention:
noteIf you already have MongoDB backend enabled, this will not test anything by default. To test,
temporarily remove the MongoDB backend, run the following and restore the MongoDB config.
curl -X POST -H "Content-Type: application/json" --data '{        "jsonrpc": "2.0",        "method": "eth_getBlockByNumber",        "params": ["0x1", false],        "id": 1    }'  http://localhost:8080

## Code Examples

```prism
sudo systemctl edit monad-execution
```

```prism
[Service]Type=simpleExecStart=ExecStart=/usr/local/bin/monad \    [... existing cli commands, see comment at the bottom of the systemctl editor ...]    --trace_calls
```

```prism
# Replace <db username>, <db pwd> and <db hostname> with your values from Step (1)MONGO_URL="mongodb://<db username>:<db pwd>@<db hostname>:27017"MONGO_DB_NAME="archive-db"DB_HOST=<db hostname>DB_PWD=<db pwd>DB_USERNAME=<db username>
```

```prism
source /home/monad/.env
nc -vz $DB_HOST 27017mongosh "$MONGO_URL" --quiet --eval '    try {    db.adminCommand({ping: 1});    const archiveDb = db.getSiblingDB("archive-db");    const hasCollection = archiveDb.getCollectionNames().includes("block_level");    print(hasCollection ? "OK: Collection exists" : "FAIL: Collection missing");    quit(hasCollection ? 0 : 1);    } catch(e) {    print("FAIL: " + e.message);    quit(1);    }'
```

```prism
sudo systemctl edit monad-rpc
```

```prism
[Service]ExecStart=ExecStart=/usr/local/bin/monad-rpc \    [... existing cli commands, see comment at the bottom of the systemctl editor ...]    --mongo-url ${MONGO_URL} \    --mongo-db-name ${MONGO_DB_NAME} \    --use-eth-get-logs-index
```

```prism
sudo systemctl daemon-reloadsudo systemctl restart monad-rpc
```

```prism
curl -X POST -H "Content-Type: application/json" --data '{        "jsonrpc": "2.0",        "method": "eth_getBlockByNumber",        "params": ["0x1", false],        "id": 1    }'  http://localhost:8080
```

```prism
{    "Version": "2012-10-17",    "Statement": [        {            "Effect": "Allow",            "Action": [                "s3:GetObject",                "s3:ListBucket",                "s3:GetBucketRequestPayment",                "execute-api:Invoke"            ],            "Resource": [                "arn:aws:s3:::*/*",                "arn:aws:s3:::*",                "arn:aws:execute-api:*:*:*"            ],            "Condition": {                "StringEquals": {                    "aws:ResourceOrgID": "o-sq9ayub2wk"                }            }        }    ]}
```

```prism
awscurl https://9df09fanz1.execute-api.us-east-2.amazonaws.com/prod/free-tier-key --region us-east-2
```

```prism
ARCHIVE_API_KEY=<key from step 3># Replace with appropriate mainnet, localnet or testnet bucket# Below is the public testnet bucket maintained by Category LabsARCHIVE_BUCKET="testnet-ltu-032-0"# Below is the public mainnet bucket maintained by Category LabsARCHIVE_BUCKET="mainnet-deu-010-0"
```

```prism
sudo systemctl edit monad-rpc
```

```prism
[Service]ExecStart=ExecStart=/usr/local/bin/monad-rpc \    [... existing cli commands, see comment at the bottom of the systemctl editor ...]    --s3-bucket ${ARCHIVE_BUCKET} \    --region "us-east-2" \    --archive-url "https://9df09fanz1.execute-api.us-east-2.amazonaws.com/prod" \    --archive-api-key ${ARCHIVE_API_KEY}
```

```prism
sudo systemctl daemon-reloadsudo systemctl restart monad-rpc
```

```prism
curl -X POST -H "Content-Type: application/json" --data '{        "jsonrpc": "2.0",        "method": "eth_getBlockByNumber",        "params": ["0x1", false],        "id": 1    }'  http://localhost:8080
```

