const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    // deploy stake
    const FurBetStake = await ethers.getContractFactory("FurBetStake");
    const furbetstake = await upgrades.deployProxy(FurBetStake);
    await furbetstake.deployed();
    await furbetstake.setAddressBook(addressBook);
    await addressbook.set('furbetstake', furbetstake.address);
    console.log("FurBetStake proxy deployed to:", furbetstake.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
