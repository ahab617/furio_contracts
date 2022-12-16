const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const Claim = await ethers.getContractFactory("Claim");
    const claim = await upgrades.deployProxy(Claim);
    await claim.deployed();
    await claim.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    await addressbook.set('claim', claim.address);
    console.log("Claim proxy deployed to:", claim.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
