const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';

async function main() {
    // GET ADDRESS BOOK
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = await AddressBook.attach(addressBook);
    // DEPLOY CLAIM
    const Claim = await ethers.getContractFactory("Claim");
    const claim = await upgrades.deployProxy(Claim);
    await claim.deployed();
    await claim.setAddressBook(addressBook);
    await claim.pause();
    await addressbook.set("claim", claim.address);
    console.log("Claim proxy deployed to:", claim.address);
    // DEPLOY DOWNLINE
    const Downline = await ethers.getContractFactory("Downline");
    const downline = await upgrades.deployProxy(Downline);
    await downline.deployed();
    await downline.setAddressBook(addressBook);
    await downline.pause();
    await addressbook.set("downline", downline.address);
    console.log("Downline proxy deployed to:", downline.address);
    // DEPLOY POOL
    const Pool = await ethers.getContractFactory("Pool");
    const pool = await upgrades.deployProxy(Pool);
    await pool.deployed();
    await pool.setAddressBook(addressBook);
    await pool.pause();
    await addressbook.set('pool', pool.address);
    console.log("Pool proxy deployed to:", pool.address);
    // DEPLOY SWAP
    const Swap = await ethers.getContractFactory("Swap");
    const swap = await upgrades.deployProxy(Swap);
    await swap.deployed();
    await swap.setAddressBook(addressBook);
    await swap.pause();
    await addressbook.set('swap', swap.address);
    console.log("Swap proxy deployed to:", swap.address);
    // DEPLOY TOKEN
    const Token = await ethers.getContractFactory("Token");
    const token = await upgrades.deployProxy(Token);
    await token.deployed();
    await token.setAddressBook(addressBook);
    await token.pause();
    await addressbook.set('token', token.address);
    console.log("Token proxy deployed to:", token.address);
    // DEPLOY VAULT
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await upgrades.deployProxy(Vault);
    await vault.deployed();
    await vault.setAddressBook(addressBook);
    await vault.pause();
    await addressbook.set('vault', vault.address);
    console.log("Vault proxy deployed to:", vault.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
