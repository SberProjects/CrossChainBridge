import './App.css';
import { Routes, Route } from 'react-router-dom'

import { FinishLoader } from './components/loaders/finishLoader';
import { TransferPage } from './components/transferPage';
import { LogInPage } from './components/logInPage';
import { ErrComp } from './components/loaders/errComponent';
import { MetaMaskSDK } from '@metamask/sdk';

//BLOCKCHAIN CONFIG
const options = {
	dappMetadata: {name: "Sber Bridge", url: "https://sber.com"},
	injectProvider: true,
	communicationLayerPreference: 'webrtc',
	preferDesktop: false
};  
export const MMSDK = new MetaMaskSDK(options);


function App() {

  return (
    <div className="App" id='main-app'>
       <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/loader" element={<FinishLoader />} />
        <Route path="/err" element={<ErrComp />} />
      </Routes>
    </div>
  );
}

export default App;
