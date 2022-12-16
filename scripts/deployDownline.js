const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const Downline = await ethers.getContractFactory("Downline");
    const downline = await upgrades.deployProxy(Downline);
    await downline.deployed();
    await downline.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    await addressbook.set('downline', downline.address);
    console.log("Downline proxy deployed to:", downline.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
