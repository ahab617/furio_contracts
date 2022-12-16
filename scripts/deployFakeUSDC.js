const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const FakeUSDC = await ethers.getContractFactory("FakeUsdc");
    const fakeUSDC = await FakeUSDC.deploy();
    await fakeUSDC.deployed();
    console.log("fakeUSDC deployed to:", fakeUSDC.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
