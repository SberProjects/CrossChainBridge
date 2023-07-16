import { ethers } from 'ethers';
import { MMSDK } from '../App';
import { changeNetwork } from "./changeNetwork";
import { MidLoader } from '../components/loaders/midLoader';
import { FinishLoader } from '../components/loaders/finishLoader';
import { ErrComp } from '../components/loaders/errComponent';
// for loaders
import { root } from '../root';
// for errors
import { footer } from '../root';

import axios from 'axios'
const bridgeAbi = require('../assets/blockchain/bridgeContract.json')
const erc1155Abi = require('../assets/blockchain/erc1155Abi.json')
require('dotenv').config()

function returnContract(blockchain) {
    if (blockchain.name === 'Ethereum') {
        return process.env.REACT_APP_BRIDGE_ADDRESS_SEPOLIA
    }
    else if (blockchain.name === 'Polygon') {
        return process.env.REACT_APP_BRIDGE_ADDRESS_MUMBAI
    }
    else if (blockchain.name === 'ComUnity') {
        return process.env.REACT_APP_BRIDGE_ADDRESS_SIBERIUM
    }
}

var provider;

async function unfreezeTokenInDB(oldBlockchain, oldSc, oldId, newBlockchain, newSc, newId) {
    try {
        root.render(<MidLoader mes={"Информация о переносе регистрируется в базе данных"} />);
        var newToken = {
            blockchain_name: newBlockchain.name,
            smart_contract_address: newSc,
            token_id: newId
        }
        console.log('send', newToken)
        await axios({
            method: "post",
            url: `${process.env.REACT_APP_SERVER_ADDRESS}/blockchains/${oldBlockchain.name}/smart-contracts/${oldSc}/tokens/${oldId}/duplicates/activate/`,
            data: newToken,
            headers: { "Content-Type": "application/json", 'Origin': 'http://localhost:3000/', },
        })
            .then(async function (response) {
                //handle success
                console.log("Request success")
                console.log("TOKEN HAS BEEN TRANSFERRED FROM", oldBlockchain, oldSc, oldId, " to ", newBlockchain, newSc, newId)
                root.render(<FinishLoader newBCH={newBlockchain} address={newSc} id={newId} />);
            })
            .catch(function (response) {
                console.log("Request failed with error", response)
                footer.render(<ErrComp errMes={`Unfreeze TokenInDB request ${response}`} />);

            });
    }
    catch (err) {
        console.log(err)
        footer.render(<ErrComp errMes={`Unfreeze TokenInDB ${err}`} />);

    }

}

function clearBytes(bytesMy) {
    var lastChar = bytesMy.substr(bytesMy.length - 1);

    var result = bytesMy
    console.log("Input", result)
    while (lastChar === '0') {
        console.log("delete", lastChar)
        result = result.slice(0, -1);
        lastChar = result.substr(result.length - 1);
        console.log("New", result)
    }
    console.log("done")
    return result
}

async function unfreezeOldToken(oldBlockchain, oldSc, oldId, newBlockchain, newSc, newId) {
    try {
        await changeNetwork(newBlockchain)
        console.log("start unfreeze new token in", newBlockchain.name)
        root.render(<MidLoader mes={"Данная транзакция разморозит дубликат токена и перенесет его из контракта-хранилища"} />);
        var contractInNewNetwork = returnContract(newBlockchain)
        var bridgeContract = new ethers.Contract(contractInNewNetwork, bridgeAbi, provider.getSigner());
        var price = await bridgeContract.priceForUnfreezeing();
        console.log("price for unfreezing", Number(price))
        var bytes = clearBytes(ethers.utils.formatBytes32String("onlyforadmin"))

        await bridgeContract.unfreezeToken(newSc, newId, bytes, { value: Number(price) }).then(transaction => {
            var tx = transaction.hash
            console.log(tx)
            provider.waitForTransaction(transaction.hash)
                .then(async (receipt) => {
                    console.log(receipt)
                    await unfreezeTokenInDB(oldBlockchain, oldSc, oldId, newBlockchain, contractInNewNetwork, newId)

                })
                .catch((error) => {
                    console.log(error)
                })
        }, error => {
            console.error(error) // from creation
            footer.render(<ErrComp errMes={`unfreezeOldToken request ${error}`} />);
        })
    }
    catch (err) {
        console.log(err)
        footer.render(<ErrComp errMes={`unfreezeOldToken ${err}`} />);
    }
}


export const unfreezeToken = async (oldBlockchain, oldSc, oldId, newBlockchain, newSc, newId) => {
    try {
        provider = new ethers.providers.Web3Provider(MMSDK.getProvider(), 'any');
        console.log("we start! unfreezeing")
        await changeNetwork(oldBlockchain)
        console.log("start transfer token to smart contract")
        root.render(<MidLoader mes={"Данная транзакция заморозит токен и перенесет его на контракт-хранилище"} />);
        var tokenHolder = returnContract(oldBlockchain);
        //transfer token to smart contract
        var tokenContract = new ethers.Contract(oldSc, erc1155Abi, provider.getSigner());
        var users = await provider.send("eth_requestAccounts", []);
        var loggedUser = users[0]


        await tokenContract.safeTransferFrom(loggedUser, tokenHolder, oldId, 1, "0x00").then(transaction => {
            provider.waitForTransaction(transaction.hash)
                .then(async (receipt) => {
                    console.log(receipt)
                    await unfreezeOldToken(oldBlockchain, oldSc, oldId, newBlockchain, newSc, newId)
                })
                .catch((error) => {
                    console.log(error)
                    footer.render(<ErrComp errMes={`unfreezeToken start request ${error}`} />);
                })
        })
    }
    catch (err) {
        console.log(err)
        footer.render(<ErrComp errMes={`unfreezeToken start ${err}`} />);
    }
}