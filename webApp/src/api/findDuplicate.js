import { sendRequest } from "./sendRequest";
import { ErrComp } from "../components/loaders/errComponent";

// for errors
import { footer } from "../root";

export const findDuplicate = async (blockchain, SC, ID, newBlockchain) => {
    try {
        var response = await sendRequest(`https://cross-chain-backend.nft.devops.lanit-tercom.com/blockchains/${blockchain.name}/smart-contracts/${SC}/tokens/${ID}/?duplicate_blockchain_name=${newBlockchain.name}`)
        if (response.detail == null) {
            return response;
        }
        else {
            console.log("ERROR IN REQUEST", response.detail)
            footer.render(<ErrComp errMes={`Find duplicate request ${response.detail}`} />);
            return null
        }
    }
    catch (err) {
        footer.render(<ErrComp errMes={`Find duplicate ${err}`} />);
        return null;
    }
}