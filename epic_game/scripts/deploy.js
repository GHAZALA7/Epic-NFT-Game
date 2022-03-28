const { hexStripZeros } = require("ethers/lib/utils")

const main = async() => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["Michal", "Jim", "Andy"],
        ["https://bit.ly/3ss29ZY", "https://bit.ly/3JZ2cCq", "https://bit.ly/3IumKSN"],
        [100,200,150],      //HP VAlue
        [100,50, 25],    //Damage Value
        "Dwight", // Boss name
        "https://bit.ly/3Hl6j9X", // Boss image
        10000, // Boss hp
        50 // Boss attack damage
    );

    await gameContract.deployed();
    console.log("Contract deployed to: ", gameContract.address);

    // let txn;
    // txn = await gameContract.mintCharacterNFT(2);
    // await txn.wait();

    // txn = await gameContract.attackBoss();
    // await txn.wait();

    // txn = await gameContract.attackBoss();
    // await txn.wait();

    //Get the values of NFTs URI
    let returnedTokenURI = await gameContract.tokenURI(1);
    // console.log("TOKEN URI: ", returnedTokenURI);
    console.log("*************** END ******************");

}

const runMain = async() => {
    try{
        await main();
        process.exit(0);
    } catch(error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();