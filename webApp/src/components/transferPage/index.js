import React, { useState } from "react";
import Select from "react-select";
// styles
import './transferPage.css'
import { CustomSelectStyle } from "../../assets/customSelectStyles";

import Arrow from '../../assets/arrow.svg'
import { useEffect } from "react";

import { ethers } from 'ethers';
import { MMSDK } from '../../App';

// imported functions
import { changeNetwork } from "../../api/changeNetwork";
import { sendRequest } from "../../api/sendRequest";
import { createDuplicatorAndTransfer } from "../../api/createDuplicatorAndTransfer";
import { findDuplicate } from "../../api/findDuplicate";
import { unfreezeToken } from "../../api/unfreezeToken";

// const bridgeAbi = require('../../assets/blockchain/bridgeContract.json')
const erc1155Abi = require('../../assets/blockchain/erc1155Abi.json')
require('dotenv').config()

const TransferPage = () => {
    const selectOptions = [
        {
            "value": { name: 'Ethereum', id: 11155111 },
            "label": "Ethereum Sepolia Testnet"
        },
        {
            "value": { name: 'Polygon', id: 80001 },
            "label": "Polygon Mumbai Testnet"
        },
        {
            "value": { name: 'ComUnity', id: 111000 },
            "label": "Siberium Testnet"
        },
    ]

    const [NFTBlockchain, setNFTBlockchain] = useState('')
    const [getNFTBlockchain, setGetNFTBlockchain] = useState('')
    const [address, setAddress] = useState('')
    const [idNft, setIdNft] = useState('')
    const [metadataUrl, setMetadataUrl] = useState('')
    const [isTokenInfo, setIsTokenInfo] = useState(false)
    const [tokenInfo, setTokenInfo] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [buttondisable, setButtonDisable]=useState(true)

    const addressOninput = (e) => {
        setAddress(e.target.value)
        var inputAddress = document.getElementById('input-address')
        var lables = document.getElementsByClassName('inputs_lable')
        if (e.target.value !== '') {
            console.log(lables)
            inputAddress.style.paddingTop = '9px';
            lables[1].style.display = 'block'
        } else {
            inputAddress.style.paddingTop = '0px';
            lables[1].style.display = 'none'
        }
    }

    const idOninput = (e) => {
        setIdNft(e.target.value)
        var inputAddress = document.getElementById('input-id')
        var lables = document.getElementsByClassName('inputs_lable')
        if (e.target.value !== '') {
            console.log(lables)
            inputAddress.style.paddingTop = '9px';
            lables[2].style.display = 'block'
        } else {
            inputAddress.style.paddingTop = '0px';
            lables[2].style.display = 'none'
        }
    }

    const blockchainOnchange = (e) => {
        setNFTBlockchain(e.value)
        var lables = document.getElementsByClassName('inputs_lable')
        lables[0].style.display = 'block'
    }

    const getblockchainOnchange = (e) => {
        setGetNFTBlockchain(e.value)
        var lables = document.getElementsByClassName('inputs_lable')
        lables[3].style.display = 'block'
    }

    //===========Blockchain
    async function getTokenInfo(smartContract, id) {
        try {
            var provider = new ethers.providers.Web3Provider(MMSDK.getProvider(), 'any');
            console.log("BLOCKCHAIN TO TRANFER", NFTBlockchain)
            try {
                await changeNetwork(NFTBlockchain);
                console.log("Contract", smartContract)
                var contract = new ethers.Contract(smartContract, erc1155Abi, provider.getSigner());
            }
            catch (err) {
                console.log(err)
            }
            var tokenMeta = await contract.uri(id)
            console.log(tokenMeta)
            setMetadataUrl(tokenMeta)
            var meta = await sendRequest(tokenMeta)
            var token = {
                name: meta.name,
                description: meta.description,
                image: meta.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
            }
            return token;
        }
        catch (err) {
            console.log(err)
            var token = {
                name: '',
                describe: '',
                image: ''
            }
            return token
        }
    }

    async function checkTokenOwner(blockchain, sc, id){
        var provider = new ethers.providers.Web3Provider(MMSDK.getProvider(), 'any');
        await changeNetwork(blockchain)
        var tokenContract = new ethers.Contract(sc, erc1155Abi, provider.getSigner());
        var users = await provider.send("eth_requestAccounts", []);
        var loggedUser = users[0]
        var balance = await tokenContract.balanceOf(loggedUser, id)
        console.log("BALANCE IS", Number(balance))
        return Number(balance)
    }


    const transferToken = async () => {
        try{
        console.log('transfer')
        console.log(NFTBlockchain, address, idNft, getNFTBlockchain)
        var duplicator = await findDuplicate(NFTBlockchain, address, idNft, getNFTBlockchain)
        console.log("DUPLICATOR was found:", duplicator)
        if (duplicator == null) {
            console.log('createDuplicatorAndTransfer')
            await createDuplicatorAndTransfer(NFTBlockchain, address, idNft, getNFTBlockchain, metadataUrl);
        }
        else {
            console.log('Duplicator was found:', duplicator.smart_contract_address, duplicator.token_id)
            await unfreezeToken(NFTBlockchain, address, idNft, getNFTBlockchain, duplicator.smart_contract_address, duplicator.token_id)
        }
        }
        catch(err){
            console.log(err)
        }   
    }

    useEffect(() => {
        (async () => {
            if (NFTBlockchain !== '' && address !== '' && idNft !== '') {
                setIsLoading(true)
                var meta = await getTokenInfo(address, idNft)
                var balance = await checkTokenOwner(NFTBlockchain, address, idNft)
                setTokenInfo(meta)
                if (balance==0){
                    console.log('not a token owner')
                    setIsTokenInfo('notAnOwner')
                    setButtonDisable( true)
                }
                else if (meta.name === '') {
                    setIsTokenInfo('err')
                    setButtonDisable(false)
                } else {
                    setIsTokenInfo(true)
                    setButtonDisable(false)
                }
                console.log('here', meta)
                setTimeout(setIsLoading(false), 10000)
            } else {
                setIsTokenInfo(false)
                setIsLoading(true)
            }
        })();
    }, [NFTBlockchain, address, idNft])


    return (
        <div className="mainContainer">
            <h2>Перемещение NFT между блокчейнами</h2>
            {/* ------------------------------------------------------Переместить откуда */}
            <div className="transferFrom_container">
                <div className="transfer_container_header">
                    <p>ОТКУДА</p>
                    <p>Блокчейн, на котором сейчас находится NFT </p>
                </div>
                <label htmlFor="NFT-blockchain" className="inputs_lable inputs_lable_blockchain">Блокчейн</label>
                <Select
                    styles={CustomSelectStyle}
                    options={selectOptions}
                    id='NFT-blockchain'
                    placeholder="Блокчейн"
                    classNamePrefix='custom_select'
                    value={selectOptions.find(obj => obj.value === NFTBlockchain)}
                    onChange={blockchainOnchange}
                />
                <label htmlFor="input-address" className="inputs_lable inputs_lable_address">Адрес смарт-контракта</label>
                <input
                    placeholder="Адрес смарт-контракта"
                    value={address}
                    onChange={addressOninput}
                    id="input-address"
                />
                <label htmlFor="input-id" className="inputs_lable inputs_lable_id">ID NFT</label>
                <input
                    placeholder="ID NFT"
                    value={idNft}
                    onChange={idOninput}
                    id="input-id"
                />
                {isTokenInfo === true &&
                    <div className="tokenInfo_container">
                        {isLoading ? <div className="loading_container"></div> : <>
                            <img src={tokenInfo.image} alt="token-img"/>
                            <p>{tokenInfo.name}</p>
                        </>}
                    </div>
                }
                {isTokenInfo === 'err' &&
                    <div className="tokenInfo_container">
                    </div>
                }
                {isTokenInfo === 'notAnOwner' &&
                    <div className="tokenInfo_container">
                        <p>Можно переводить только токены принадлежщие Вам</p>
                    </div>
                }
                <img src={Arrow} alt="arrow-icon" className="arrowIcon" />
            </div>
            {/* ------------------------------------------------------Переместить куда */}
            <div className="transferTo_container">
                <div className="transfer_container_header">
                    <p>КУДА</p>
                    <p>Блокчейн, на который хотите переместить NFT </p>
                </div>
                <label htmlFor="getNFT-blockchain" className="inputs_lable inputs_lable_getblockchain">Блокчейн</label>
                <Select
                    styles={CustomSelectStyle}
                    options={selectOptions}
                    id='getNFT-blockchain'
                    placeholder="Блокчейн"
                    classNamePrefix='custom_select'
                    value={selectOptions.find(obj => obj.value === getNFTBlockchain)}
                    onChange={getblockchainOnchange}
                />
            </div>
            <button disabled={buttondisable} onClick={transferToken}>Переместить</button>
        </div>
    )
}

export { TransferPage }