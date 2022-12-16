const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    const voteaddress = await addressbook.get("vote");
    const Vote = await ethers.getContractFactory("Vote");
    await upgrades.upgradeProxy(voteaddress, Vote);
    console.log("Vote contract upgraded", voteaddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
