# Monad Developer Documentation

> Source: https://docs.monad.xyz/reference/json-rpc/web3_clientVersion

## Documentation

web3_clientVersionNetwork:TestnetMainnetTry itReturnsstring📤 RequestCopycurl --request POST \
     --url https://rpc-mainnet.monadinfra.com \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '
{
  "id": 0,
  "jsonrpc": "2.0",
  "method": "web3_clientVersion",
  "params": []
}
'

