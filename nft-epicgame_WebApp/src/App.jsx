import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from'./Components/SelectCharacter';
import {CONTRACT_ADDRESS, transformCharacterData} from './constant';
import myEpicGame from './utils/MyEpicGame.json';
import {ethers} from 'ethers';
import Arena from "./Components/Arena";
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  //State Variable to store the the user's public Wallet
  const [currentAccount, setCurrentAccount] = useState(null);
  const [charachterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const checkIfWalletIsConnected = async () => {
    try {
       const {ethereum} = window;
    if(!ethereum) {
      console.log("Make sure you have Metamask");
       setIsLoading(false)
      return;
    } else {
      console.log("Wallet connected: ", ethereum);
    }

    //Check if we are authorized to access the user's account
    const accounts = await ethereum.request({method: 'eth_accounts'});

    //Users can have mutiple authorized accounts: We grab the first one
    if(accounts.length != 0 ){
      const account = accounts[0];
      console.log("Account found: ", account);
      setCurrentAccount(account);
    }else{
      console.log("No authorized account found");
    }
    } catch (error) {
      console.log(error);
    }
   /*
     * We release the state property after all the function logic
     */
    setIsLoading(false);
  }

  // Render Methods
  const renderContent = () => {
    if(isLoading){
      return <LoadingIndicator  />;
    }
      //If user has not connected tto Wallet --> Show Connect to Wallet button
      if(!currentAccount) {
        return(
          <div className = "connect-wallet-container">
            <img src = "https://bit.ly/3tupeuh"
                 alt="Monty Python Gif"/>
            <button className="cta-button connect-wallet-button"
                    onClick = {connectWalletAction}>
              Connect Wallet to Play this Epic Game
            </button>
          </div>
        );
      } else if(currentAccount && !charachterNFT) {
        return <SelectCharacter setCharacterNFT = {setCharacterNFT} />;        
      }   else if (currentAccount && charachterNFT) {
        return <Arena characterNFT = {charachterNFT} setCharacterNFT={setCharacterNFT} />
      }
  };
  
  const connectWalletAction = async () => {
    try {
      const {ethereum} = window;
      if(!ethereum){
        alert("Get Metamask for this Game");
        return;
      } 
      const accounts = await ethereum.request({method: 'eth_requestAccounts',});
      console.log("Wallet connected: ",accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const checkNetwork = async () => {
    try {
      if(window.ethereum.networkVersion != 4){
        alert("Please connect to Rinkeby!");
      }else{
        console.log("Connected to Rinkeby");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  //This runs our function when our page loads
  useEffect(() => {
    //Anytime our component mounts, make sure to load our component immediately
    setIsLoading(true);
    checkIfWalletIsConnected()
  }, []);
 
  useEffect(() => {
    //The function that interacts with our smart contract
    const fetchNFTMetaData = async () => {
      console.log("Checking for character NFT on address: ",currentAccount);

      //Logic to create ether object and call the contract
      // Provider: use to talk to ethereum Nodes
      //In the smart contract we used alchemy in hardhat.config.js, similarly here
      //we are using Node that Metamask provides
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      //signer: Refer- https://docs.ethers.io/v5/api/signer/#signers
      const signer = provider.getSigner();
      //makes connection with the Contract
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      //This goes to Smart COntract and gets the data 
      const txn = await gameContract.checkIfUserHasNFT();
      console.log("TXN has these values: ", txn);
      if(txn.name){
        console.log("User has Character NFT");
        setCharacterNFT(transformCharacterData(txn));
     /*
     * Once we are done with all the fetching, set loading state to false
     */
      setIsLoading(false);        
      } else {
        console.log("User has no NFT");        
      } 
    };

    if(currentAccount){
      console.log("Current Account: ", currentAccount);
      fetchNFTMetaData();
    }
  }, [currentAccount]);
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ The Office Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the your Team against Dwight!</p>
          {/* This is where our button and image code used to be!
         *	Remember we moved it into the render method.
         */}
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
