const { ethers } = require("hardhat");
require("dotenv").config();

const addressBook = process.env.ADDRESS_BOOK || '';
let contract;

async function main() {
    // GET ADDRESS BOOK
    const AddressBook = await ethers.getContractFactory("AddressBook");
    const addressbook = AddressBook.attach(addressBook);
    // UNPAUSE CLAIM
    const claimAddress = await addressbook.get("claim");
    const Claim = await ethers.getContractFactory("Claim");
    contract = Claim.attach(claimAddress);
    if(!await contract.paused()) {
        await contract.pause();
    }
    console.log("Claim paused");
    // UNPAUSE DOWNLINE
    const downlineAddress = await addressbook.get("downline");
    const Downline = await ethers.getContractFactory("Downline");
    contract = Downline.attach(downlineAddress);
    if(!await contract.paused()) {
        await contract.pause();
    }
    console.log("Downline paused");
    // UNPAUSE POOL
    const poolAddress = await addressbook.get("pool");
    const Pool = await ethers.getContractFactory("Pool");
    contract = Pool.attach(poolAddress);
    if(!await contract.paused()) {
        await contract.pause();
    }
    console.log("Pool paused");
    // UNPAUSE SWAP
    const swapAddress = await addressbook.get("swap");
    const Swap = await ethers.getContractFactory("Swap");
    contract = Swap.attach(swapAddress);
    if(!await contract.paused()) {
        await contract.pause();
    }
    console.log("Swap paused");
    // UNPAUSE TOKEN
    const tokenAddress = await addressbook.get("token");
    const Token = await ethers.getContractFactory("Token");
    contract = Token.attach(tokenAddress);
    if(!await contract.paused()) {
        await contract.pause();
    }
    console.log("Token paused");
    // UNPAUSE VAULT
    const vaultAddress = await addressbook.get("vault");
    const Vault = await ethers.getContractFactory("Vault");
    contract = Vault.attach(vaultAddress);
    if(!await contract.paused()) {
        await contract.pause();
    }
    console.log("Vault paused");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
