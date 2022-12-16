const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    const claimaddress = await addressbook.get("claim");
    const Claim = await ethers.getContractFactory("Claim");
    await upgrades.upgradeProxy(claimaddress, Claim);
    console.log("Claim contract upgraded", claimaddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
