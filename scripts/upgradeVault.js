const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    const vaultaddress = await addressbook.get("vault");
    const Vault = await ethers.getContractFactory("Vault");
    await upgrades.upgradeProxy(vaultaddress, Vault);
    console.log("Vault contract upgraded", vaultaddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
