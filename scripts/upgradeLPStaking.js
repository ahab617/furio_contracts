const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    const lpStakingAddress = await addressbook.get("lpStaking");
    const LPStakingV1 = await ethers.getContractFactory("LPStakingV1");
    await upgrades.upgradeProxy(lpStakingAddress, LPStakingV1);
    console.log("LPStaking contract upgraded", lpStakingAddress);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
