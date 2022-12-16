const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await upgrades.deployProxy(Vote);
    await new Promise(r => setTimeout(r, 2000));
    await vote.deployed();
    await new Promise(r => setTimeout(r, 2000));
    await vote.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = AddressBook.attach(addressBook);
    await new Promise(r => setTimeout(r, 2000));
    await addressbook.set("vote", vote.address);
    console.log("Vote proxy deployed to:", vote.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
