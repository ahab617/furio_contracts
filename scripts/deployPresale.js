const { ethers } = require("hardhat");

async function main() {
    const Presale = await ethers.getContractFactory("Presale");
    const presale = await Presale.deploy();
    console.log("Presale deployed to:", presale.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
