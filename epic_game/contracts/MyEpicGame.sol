// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";   
import "./libraries/Base64.sol";

// Our contract inherits from ERC721, which is the standard NFT contract!
contract MyEpicGame is ERC721 {

    struct CharacterAttributes {
        uint charchterIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    // The tokenId is the NFTs unique identifier, it's just a number that goes
    // 0, 1, 2, 3, etc.
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    CharacterAttributes[] defaultcharacters;

  // We create a mapping from the nft's tokenId => that NFTs attributes. --> Like permanent Global Variables
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    // A mapping from an address => the NFTs tokenId. Gives me an ez way
    // to store the owner of the NFT and reference it later.  --> Like permanent Global Variables
    mapping(address => uint256) public nftHolders;

    //Events are like webhooks. We can 'fire' an event from Solidity and then Catch that in our webapp
    event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);   //Fire when we Finish Minting our NFT. This will help us tell user that the NFT has been minted!
    event AttackComplete(uint newBossHp, uint newPlayerHp);

    //Data for boss
    //Boss will not be an NFT. Its data will just stay on the contract
    struct BigBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;        
    }

    BigBoss public bigboss;

    constructor(string[] memory characterNames,
                string[] memory characterImageURIs,
                uint[] memory characterHP,
                uint[] memory characterAttackDamage,
                string memory bossName,         //These new vaariable will be passed with run.js or deploy.js
                string memory bossImageURI,
                uint bossHp,
                uint bossAttackDamage) 
                
        // Below, is a special identifier symbols for our NFT.
        // This is the name and symbol for our token, eg: Ethereum and ETH. I just call mine
        // Heroes and HERO. Remember, an NFT is just a token!
        ERC721("Dwight", "DWIGHT")

        {

        // Initialize the boss. Save it to our global "bigBoss" state variable.
        bigboss = BigBoss({
                name: bossName,
                imageURI: bossImageURI,
                hp: bossHp,
                maxHp: bossHp,  
                attackDamage: bossAttackDamage
            }
        );
        console.log("Done initializing boss %s w/ HP %s, img %s", bigboss.name, bigboss.hp, bigboss.imageURI);

        for(uint i=0; i< characterNames.length; i++) {
            defaultcharacters.push( CharacterAttributes({
                charchterIndex: i,
                name: characterNames[i],
                imageURI: characterImageURIs[i],
                hp: characterHP[i],
                maxHp: characterHP[i],
                attackDamage: characterAttackDamage[i]
            }));
            CharacterAttributes memory c = defaultcharacters[i];
            console.log("Done initializing %s w/ HP %s, img %s", c.name, c.hp, c.imageURI);
        }
        // I increment _tokenIds here so that my first NFT has an ID of 1.
        // More on this in the lesson!
        _tokenIds.increment();
        console.log("THIS IS MY FIRST EVER GAME IN SOLIDITY!!!!!!!!!");
    }

    // Users would be able to hit this function and get their NFT based on the
    // characterId they send in!
    function mintCharacterNFT(uint _characterIndex) external {
        // Get current tokenId (starts at 1 since we incremented in the constructor).
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        nftHolderAttributes[newItemId] = CharacterAttributes({
            charchterIndex: _characterIndex,
            name: defaultcharacters[_characterIndex].name,
            imageURI: defaultcharacters[_characterIndex].imageURI,
            hp: defaultcharacters[_characterIndex].hp,
            maxHp: defaultcharacters[_characterIndex].maxHp,
            attackDamage: defaultcharacters[_characterIndex].attackDamage        
        });
            console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);
            
            // Keep an easy way to see who owns what NFT.
            nftHolders[msg.sender] = newItemId;

            // Increment the tokenId for the next person that uses it.
            _tokenIds.increment();

            //Fire the CharacterNFTMinted event here 
            // Our web app will be able to catch this event when NFT is minted
            emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);

    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];
        
        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

        string memory json = Base64.encode(
            abi.encodePacked(
             '{"name": "',
      charAttributes.name,
      ' -- NFT #: ',
      Strings.toString(_tokenId),
      '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "ipfs://',
      charAttributes.imageURI,
      '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
      strAttackDamage,'} ]}'
            )
        );  
        string memory output  =  string(abi.encodePacked("data:application/json;base64,",json));
        return output;
    }

    function attackBoss() public{
        //Get the state of player's NFT
        //Make sure the player has hp > 0
        //Make sure boss has hp > 0
        //Allow player to attack Boss
        //Allow boss to attack player

        //Get the state of player's NFT    
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        console.log("NFT Player token Id is %s",nftTokenIdOfPlayer);
        //Here we used 'storage' and not 'memory' because when we do player.hp = 0 it will update the data of NFT
        //Making it 'storage' it will create a local copy of this variable in this functiona nd not update the global value of this NFT ffor this player/
        CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
        console.log("\nPlayer w/ charchter %s about to attack has hp %s and %s as attackdamage ", player.name, player.hp, player.attackDamage);
        console.log("\nBoss %s has %s as HP and %s as AttackDamage",bigboss.name, bigboss.hp, bigboss.attackDamage);

        //Make sure the playeer hp> 0
        require(
            player.hp > 0,
            "Error: Character must have HP to attack Boss"
        );

        //Make sure Boss has hp > 0
        require(
            bigboss.hp > 0,
            "Error: Boss must have HP > 0"
        );

        //Allowing Player to attack the Boss
        if(bigboss.hp < player.attackDamage) {
            bigboss.hp = 0;
        } else {
            bigboss.hp = bigboss.hp - player.attackDamage;
        }

        // Allow Boss to attack Player
        if(player.hp < bigboss.attackDamage){
            player.hp = 0;
        }else{
            player.hp = player.hp - bigboss.attackDamage;
        }

        //console
        console.log("After attacking: Boss HP is %s",bigboss.hp);
        console.log("After attacking: Player HP is %s", player.hp);

        //Fire AttackComplete event that will help us update the Player's and Boss's new HP without reloadig the page
        emit AttackComplete(bigboss.hp, player.hp);
    }

    function checkIfUserHasNFT() public view  returns (CharacterAttributes memory){
        // PLAN
        //Get the tokenId of the user's charachter NFT
        //If User has a tokenID in the map, return their charcter 
        //Else, return an empty String

        //Get the tokenId of the user's charachter NFT
        uint userNFTTokenId = nftHolders[msg.sender];
        
        //If User has a tokenID in the map, return their charcter 
        if(userNFTTokenId > 0){
            return nftHolderAttributes[userNFTTokenId];
        } else{
              //Else, return an empty String
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    //Get all the characters for users to view all the charachters they can mint
    function getAllDefaultCharacters() public view returns(CharacterAttributes[] memory) {
        return defaultcharacters;
    }

    //When the game starts get all the current attributes : HP attackdamage which have been reduced due to attack from previous 
    function getBigBoss() public view returns(BigBoss memory)  {
        return bigboss;
    }
}