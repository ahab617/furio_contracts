const { ethers } = require("hardhat");

async function main() {
    const FT1 = await ethers.getContractFactory("FakeToken1");
    const ft1 = await FT1.deploy();
    console.log("Fake token 1 deployed to:", ft1.address);
    const FT2 = await ethers.getContractFactory("FakeToken2");
    const ft2 = await FT2.deploy();
    console.log("Fake token 2 deployed to:", ft2.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
