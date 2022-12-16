const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const FakeUSDT = await ethers.getContractFactory("FakeUsdt");
    const fakeUSDT = await FakeUSDT.deploy();
    await fakeUSDT.deployed();
    console.log("fakeUSDT deployed to:", fakeUSDT.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
