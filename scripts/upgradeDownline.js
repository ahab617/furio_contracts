const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    const downlineAddress = await addressbook.get("downline");
    const Downline = await ethers.getContractFactory("DownlineV2");
    await upgrades.upgradeProxy(downlineAddress, Downline);
    console.log("Downline contract upgraded", downlineAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
