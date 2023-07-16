import { ethers } from 'ethers';
import { MMSDK } from '../App';
import { changeNetwork } from "./changeNetwork";
import { MidLoader } from "../components/loaders/midLoader";
import { FinishLoader } from "../components/loaders/finishLoader";
import { ErrComp } from "../components/loaders/errComponent";

// for loaders
import { root } from "../root";
// for errors
import { footer } from "../root";

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

var provider

async function newTokenRegistration(oldBlockchain, oldSC, oldID, newBlockchain, newSC, newID) {
    try {
        root.render(<MidLoader mes={"Информация о переносе регистрируется в базе данных"} />);
        var newToken = {
            blockchain_name: newBlockchain.name,
            smart_contract_address: newSC,
            token_id: newID
        }

        console.log('send', newToken)
        await axios({
            method: "post",
            url: `${process.env.REACT_APP_SERVER_ADDRESS}/blockchains/${oldBlockchain.name}/smart-contracts/${oldSC}/tokens/${oldID}/duplicates/`,
            data: newToken,
            headers: { "Content-Type": "application/json", 'Origin': 'http://localhost:3000/', },
        })
            .then(async function (response) {
                //handle success
                console.log("Request success")
                console.log(response);
                console.log("TOKEN HAS BEEN TRANSFERRED FROM", oldBlockchain, oldSC, oldID, " to ", newBlockchain, newSC, newID)
                root.render(<FinishLoader newBCH={newBlockchain} address={newSC} id={newID} />);
            })
            .catch(function (response) {
                console.log("Request failed with error", response)
                footer.render(<ErrComp errMes={`New token registration ${response}`} />);
            });

    }
    catch (err) {
        console.log("Error")
        footer.render(<ErrComp errMes={`New token registration ${err}`} />);
    }

}

async function mintNewToken(oldBlockchain, oldSC, oldID, newBlockchain, metadataUrl) {
    try {
        await changeNetwork(newBlockchain)
        console.log("start mint new token in", newBlockchain.name)
        root.render(<MidLoader mes={"Данная транзакция выпускается на новом блокчейне"} />);
        var contractInNewNetwork = returnContract(newBlockchain)
        console.log("New contract is", contractInNewNetwork)
        var bridgeContract = new ethers.Contract(contractInNewNetwork, bridgeAbi, provider.getSigner());
        console.log("BRIDGE contract is", bridgeContract)
        var price = await bridgeContract.priceForMinting();
        console.log("price for minting", Number(price))
        await bridgeContract.mintNft(metadataUrl, { value: Number(price) }).then(transaction => {
            var tx = transaction.hash
            console.log(tx)
            provider.waitForTransaction(transaction.hash)
                .then((receipt) => {
                    console.log(receipt)
                })
                .catch((error) => {
                    console.log(error)
                })

            bridgeContract.on("newToken", async (creator, id) => {
                console.log({
                    to: creator,
                    id: Number(id)
                });

                var newTokenID = Number(id);
                await newTokenRegistration(oldBlockchain, oldSC, oldID, newBlockchain, contractInNewNetwork, newTokenID)

                // await newTokenRegistration("Ethereum", "0x3649c7BEFA96FE09559c2691c96a679BfbC66276", 22, "Polygon", "0xC334930fcC1b611B98D6C29A786D6Ee7bbe8A53C", 1)
            }, error => {
                console.error(error) // from creation
                footer.render(<ErrComp errMes={`Mint New Token ${error}`} />);

            })
        })
    }
    catch (err) {
        console.log("Error")
        footer.render(<ErrComp errMes={`Mint New Token ${err}`} />);
    }
}

export const createDuplicatorAndTransfer = async (oldBlockchain, oldSC, oldID, newBlockchain, metadataUrl) => {
    try {
        provider = new ethers.providers.Web3Provider(MMSDK.getProvider(), 'any');
        await changeNetwork(oldBlockchain)
        console.log("start transfer token to smart contract")
        root.render(<MidLoader mes={"Данная транзакция заморозит токен и перенесет его на контракт-хранилище"} />);
        var tokenHolder = returnContract(oldBlockchain);
        //transfer token to smart contract
        var tokenContract = new ethers.Contract(oldSC, erc1155Abi, provider.getSigner());
        console.log(1)
        var users = await provider.send("eth_requestAccounts", []);
        console.log(2)
        var loggedUser = users[0]
        console.log(3)

        await tokenContract.safeTransferFrom(loggedUser, tokenHolder, oldID, 1, "0x00").then(transaction => {
            provider.waitForTransaction(transaction.hash)
                .then(async (receipt) => {
                    console.log(receipt)
                    await mintNewToken(oldBlockchain, oldSC, oldID, newBlockchain, metadataUrl)
                })
                .catch((error) => {
                    console.log(error)
                    footer.render(<ErrComp errMes={`Wait for transaction ${error}`} />);
                })
        })
    }
    catch (err) {
        console.log("Error")
        footer.render(<ErrComp errMes={`Wait for transaction ${err}`} />);
    }
}