import React, {useEffect, useState} from 'react';
import './SelectCharacter.css';
import {ethers} from "ethers";
import {CONTRACT_ADDRESS, transformCharacterData} from "../../constant";
import myEpicGame from "../../utils/MyEpicGame.json"
import LoadingIndicator from "../../Components/LoadingIndicator";

const SelectCharacter = ({setCharacterNFT}) => {
  const [characters, setCharacters] =  useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);
  
  const mintCharacterNFTAction = async (characterId) => {
    try {
      if(gameContract) {
        //Show Loading Indicator
        setMintingCharacter(true);
        console.log("Miniting in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();        
        console.log("Mint Txn: ", mintTxn);
        //Hide Loading Indicator
        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn("Error in Minting process: ", error);
       /*
     * If there is a problem, hide the loading indicator as well
     */
    setMintingCharacter(false);
    }
  }
  //Set our game contract
  useEffect (() => {
      const { ethereum } = window;

  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );
    /*
     * This is the big difference. Set our gameContract in state.
     */
    setGameContract(gameContract);
    }else{
      console.log("Ethereum Object not found!!!");
    }    
  }, []);

  //Get All default 'characters' through setCharacters from Contract
  useEffect(() => {
  const getCharacters = async () => {
    try {
      console.log('Getting contract characters to mint');

      /*
       * Call contract to get all mint-able characters
       */
      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log('charactersTxn:', charactersTxn);

      /*
       * Go through all of our characters and transform the data
       */
      const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData)
      );

      /*
       * Set all mint-able characters in state
       */
      setCharacters(characters);
    } catch (error) {
      console.error('Something went wrong fetching characters:', error);
    }
  };
    
    //Add a callback method that will fire when this event is received:
    const onCharacterMint = async(sender, tokenId, characterIndex) => {
      console.log(
        `Character NFT Minted having: sender: ${sender}, TokenId: ${tokenId} and CharacterIndex: ${characterIndex.toNumber()}`
      )

      /*
     * Once our character NFT is minted we can fetch the metadata from our contract
     * and set it in state to move onto the Arena
     */
      if(gameContract){
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log("CharacterNFT with user is: ", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };    
  /*
   * If our gameContract is ready, let's get characters!
   */
  if (gameContract) {
    getCharacters();
     /*
     * Setup NFT Minted Listener
     */
    gameContract.on("CharacterNFTMinted", onCharacterMint);
  }
    return() => {
      //When the components unmounts make sure to clean up the listener
      if(gameContract){
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
}, [gameContract]);

  const renderCharacters = () => 
    characters.map((character, index) => (
      <div className = "character-item" key={character.name}>
        <div className = "name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name}/>
        <button type="button"
                className = "character-mint-button"
                 onClick = {() => mintCharacterNFTAction(index)} >
          {`Mint ${character.name}`}
        </button>        
      </div>
    ));  
  
  return(
    <div className = "select-character-container">
      <h2> Mint your Employee. Choose wisely :P </h2>
      {characters.length > 0 && 
      ( <div className = "character-grid"> {renderCharacters()} </div> )}
      {/*Only show loading state if miniting charachter is true */}
      {mintingCharacter && (
        <div className = "loading">
          <div className = "indicator">
            <LoadingIndicator />
            <p> Minting in Progress .... </p>            
          </div>
          <img
          src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
          alt="Minting loading indicator"
        />
        </div>
      )}
    </div>
  )
}

export default SelectCharacter;