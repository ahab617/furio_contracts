const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const LPStaking = await ethers.getContractFactory("LPStaking");
    const lpStaking = await upgrades.deployProxy(LPStaking);
    await lpStaking.deployed();
    await lpStaking.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    await addressbook.set('lpStaking', lpStaking.address);
    console.log("LPStaking proxy deployed to:", lpStaking.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
