const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    const AC = await ethers.getContractFactory("AutoCompoundV2");
    const ac = await upgrades.deployProxy(AC);
    await ac.deployed();
    await ac.setAddressBook(addressBook);
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = AddressBook.attach(addressBook);
    const cacaddress = await addressbook.get("autocompound");
    const CAC = await ethers.getContractFactory("AutoCompound");
    const cac = CAC.attach(cacaddress);
    const compounding = await cac.compounding();
    let periods = 0;
    for(i = 0; i < compounding.length; i ++) {
        if(compounding[i] != "0x0000000000000000000000000000000000000000") {
            periods = await cac.compoundsLeft(compounding[i]);
            //await ac.addPeriods(compounding[i], periods);
            console.log(compounding[i] + " -- " + periods);
        }
    }
    await addressbook.set('oldautocompound', cac.address);
    await addressbook.set('autocompound', ac.address);
    console.log("AutoCompoundV2 proxy deployed to:", ac.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
