const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AutoCompound = await ethers.getContractFactory("AutoCompound");
    const autocompound = await upgrades.deployProxy(AutoCompound);
    await autocompound.deployed();
    await autocompound.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    await addressbook.set('autocompound', autocompound.address);
    console.log("AutoCompound proxy deployed to:", autocompound.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
