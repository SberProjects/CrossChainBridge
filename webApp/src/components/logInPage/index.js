import React from "react";
import { useNavigate } from "react-router-dom";

import { ethers } from "ethers";
import { MMSDK } from '../../App';


const LogInPage = () => {

    const navigate = useNavigate();

    
    const login = async () => {
        const ethereum = MMSDK.getProvider();
		var provider = new ethers.providers.Web3Provider(ethereum);
		var users = await provider.send("eth_requestAccounts", []);
		console.log('Connected to', users, ethereum.networkVersion)
        navigate("/transfer");
    }


    return (
        <div className="logInPage_container">
            <button onClick={login}>Войти</button>
        </div>
    )
}

export { LogInPage }