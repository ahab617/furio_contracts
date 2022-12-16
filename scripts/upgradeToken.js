const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    const tokenaddress = await addressbook.get("token");
    const TokenV1 = await ethers.getContractFactory("TokenV1");
    await upgrades.upgradeProxy(tokenaddress, TokenV1);
    console.log("Token contract upgraded", tokenaddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
