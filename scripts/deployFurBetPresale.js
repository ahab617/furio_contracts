const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    // deploy presale
    const FurBetPresale = await ethers.getContractFactory("FurBetPresale");
    const furbetpresale = await upgrades.deployProxy(FurBetPresale);
    await furbetpresale.deployed();
    await furbetpresale.setAddressBook(addressBook);
    await addressbook.set('furbetpresale', furbetpresale.address);
    console.log("FurBetPresale proxy deployed to:", furbetpresale.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
