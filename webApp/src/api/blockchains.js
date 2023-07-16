import { ethers } from 'ethers';

const sepolia = [{
    chainName: 'Sepolia',
    chainId: ethers.utils.hexValue(11155111),
    nativeCurrency: { name: 'SepoliaETH', decimals: 18, symbol: 'SepoliaETH' },
    rpcUrls: ['https://sepolia.infura.io/v3/']
}]

const siberium = [{
    chainName: 'Siberium',
    chainId: ethers.utils.hexValue(111000),
    nativeCurrency: { name: 'SIBR', decimals: 18, symbol: 'SIBR' },
    rpcUrls: ['https://siberium-test-network.rpc.thirdweb.com']
}]

const mumbai = [{
    chainName: 'Mumbai',
    chainId: ethers.utils.hexValue(80001),
    nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
    rpcUrls: ['https://polygon-mumbai.infura.io/v3/']
}]

export {sepolia, siberium, mumbai}