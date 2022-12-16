const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    // deploy token
    const FurBetToken = await ethers.getContractFactory("FurBetToken");
    const furbettoken = await upgrades.deployProxy(FurBetToken);
    await furbettoken.deployed();
    await furbettoken.setAddressBook(addressBook);
    await addressbook.set('furbettoken', furbettoken.address);
    console.log("FurBetToken proxy deployed to:", furbettoken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
