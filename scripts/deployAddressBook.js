const { ethers, upgrades } = require("hardhat");

async function main() {
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await upgrades.deployProxy(AddressBook);
    await addressbook.deployed();
    console.log("AddressBook proxy deployed to:", addressbook.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
