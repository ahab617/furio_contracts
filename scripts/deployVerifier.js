const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await upgrades.deployProxy(Verifier);
    await verifier.deployed();
    await verifier.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    await addressbook.set('verifier', verifier.address);
    console.log("Verifier proxy deployed to:", verifier.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
