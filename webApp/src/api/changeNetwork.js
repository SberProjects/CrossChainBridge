import { ethers } from 'ethers';
import { MMSDK } from '../App';
import { sepolia, siberium, mumbai } from './blockchains';
import { ErrComp } from '../components/loaders/errComponent';
import { footer } from '../root';

export const changeNetwork = async (newNetwork) => {
    const ethereum = MMSDK.getProvider();
    const network = ethereum.networkVersion;
    console.log(newNetwork)
    var networkInfo;
    if (newNetwork === 11155111) {
        networkInfo = sepolia
    }
    else if (newNetwork === 111000) {
        networkInfo = siberium
    }
    else if (newNetwork === 80001) {
        // здесь до этого было network = mumbai, из контекста как будто должно быть так как стало, но на всякий случай !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        networkInfo = mumbai
    }

    console.log("New network is", newNetwork, "with info", networkInfo)

    if (network !== newNetwork.id) {
        console.log("try to change", network, "to", newNetwork.id)
        try {
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: ethers.utils.hexValue(newNetwork.id) }]
            });
        } catch (switchError) {
            console.log("failed change", switchError)
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: networkInfo
                    });
                } catch (error) {
                    console.log("ERROR", error)
                    footer.render(<ErrComp errMes={`Change network error ${error}`}/>);
                }
            }
        }
        console.log("Network has beend changed")
    }
}
