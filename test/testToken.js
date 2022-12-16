const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const EthCrypto = require("eth-crypto");
const { delay, toBigNum, fromBigNum } = require("./utils.js");

var ERC20ABI = artifacts.readArtifactSync("contracts/FakeUsdc.sol:IERC20").abi;
var pairContract;
var exchangeRouter;
var exchangeFactory;
let wBNB;
let fakeUSDC;

let addressbook;
let claim;
let downline;
let pool;
let presale;
let swap;
let token;
let tokenV1;
let vault;
let verifier;
let lpStaking;
let addLiquidity;

var owner;
var safe;
var user1;
var user2;

describe("Create Account and wallet", () => {
  it("Create Wallet", async () => {
    [owner, safe, user1, user2] = await ethers.getSigners();
  });
});

describe("Contracts deploy", () => {
  // ------ dex deployment ------- //
  it("Factory deploy", async () => {
    const Factory = await ethers.getContractFactory("PancakeFactory");
    exchangeFactory = await Factory.deploy(owner.address);
    await exchangeFactory.deployed();
    console.log(await exchangeFactory.INIT_CODE_PAIR_HASH());
  });

  it("WBNB deploy", async () => {
    const WBNB_ = await ethers.getContractFactory("WBNB");
    wBNB = await WBNB_.deploy();
    await wBNB.deployed();
  });

  it("Router deploy", async () => {
    const Router = await ethers.getContractFactory("PancakeRouter");
    exchangeRouter = await Router.deploy(exchangeFactory.address, wBNB.address);
    await exchangeRouter.deployed();
  });

  // ------ dex deployment ------- //
  it("FakeUSDC deploy", async () => {
    const FakeUSDC_ = await ethers.getContractFactory("FakeUsdc");
    fakeUSDC = await FakeUSDC_.deploy();
    await fakeUSDC.deployed();
  });

  it("AddressBook deploy", async () => {
    AddressBook = await ethers.getContractFactory("AddressBook");
    addressbook = await upgrades.deployProxy(AddressBook);
    await addressbook.deployed();

    await addressbook.set("safe", safe.address);
    await addressbook.set("payment", fakeUSDC.address);
    await addressbook.set("router", exchangeRouter.address);
    await addressbook.set("factory", exchangeFactory.address);
  });

  it("Claim deploy", async () => {
    Claim = await ethers.getContractFactory("Claim");
    claim = await upgrades.deployProxy(Claim);
    await claim.deployed();
    await claim.setAddressBook(addressbook.address);
    await addressbook.set("claim", claim.address);
  });

  it("Downline deploy", async () => {
    Downline = await ethers.getContractFactory("Downline");
    downline = await upgrades.deployProxy(Downline);
    await downline.deployed();
    await downline.setAddressBook(addressbook.address);
    await addressbook.set("downline", downline.address);
  });

  it("Pool deploy", async () => {
    Pool = await ethers.getContractFactory("Pool");
    pool = await upgrades.deployProxy(Pool);
    await pool.deployed();
    await pool.setAddressBook(addressbook.address);
    await addressbook.set("pool", pool.address);

    // console.log(pool.address," pool/proxy");
  });

  it("Swap deploy and set", async () => {
    Swap = await ethers.getContractFactory("Swap");
    swap = await upgrades.deployProxy(Swap);
    await swap.deployed();
    await swap.setAddressBook(addressbook.address);
    await addressbook.set("swap", swap.address);
  });

  it("Token deploy and set", async () => {
    Token = await ethers.getContractFactory("Token");
    TokenV1 = await ethers.getContractFactory("TokenV1");

    token = await upgrades.deployProxy(Token);
    console.log(token.address, " token/proxy");
    console.log(
      await upgrades.erc1967.getImplementationAddress(token.address),
      " getImplementationAddress"
    );
    console.log(
      await upgrades.erc1967.getAdminAddress(token.address),
      " getAdminAddress"
    );
    tokenV1 = await upgrades.upgradeProxy(token.address, TokenV1);
    console.log(tokenV1.address, " tokenV1/proxy after upgrade");
    console.log(
      await upgrades.erc1967.getImplementationAddress(tokenV1.address),
      " getImplementationAddress after upgrade"
    );
    console.log(
      await upgrades.erc1967.getAdminAddress(tokenV1.address),
      " getAdminAddress after upgrade"
    );

    await tokenV1.setInit();
    await tokenV1.setAddressBook(addressbook.address);
    await addressbook.set("token", tokenV1.address);
  });

  it("Vault deploy and set", async () => {
    Vault = await ethers.getContractFactory("Vault");
    vault = await upgrades.deployProxy(Vault);
    await vault.deployed();
    await vault.setAddressBook(addressbook.address);
    await addressbook.set("vault", vault.address);
  });

  it("Verifier deploy and set", async () => {
    Verifier = await ethers.getContractFactory("Verifier");
    verifier = await upgrades.deployProxy(Verifier);
    await verifier.deployed();
    await verifier.setAddressBook(addressbook.address);
    await verifier.updateSigner(owner.address);
    await addressbook.set("verifier", verifier.address);
  });

  it("Presale deploy and set", async () => {
    Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy();
    await addressbook.set("presale", presale.address);

    await presale.setTreasury(owner.address);
    await presale.setPaymentToken(fakeUSDC.address);
    await presale.setVerifier(verifier.address);
  });

  it("AddLiquidity deploy and set", async () => {
    Addliquidity = await ethers.getContractFactory("AddLiquidity");
    addLiquidity = await upgrades.deployProxy(Addliquidity);
    await addLiquidity.deployed();
    await addLiquidity.setAddressBook(addressbook.address);
    await addressbook.set("addLiquidity", addLiquidity.address);
  });

  it("LPStaking deploy and set", async () => {
    LPStaking = await ethers.getContractFactory("LPStaking");
    lpStaking = await upgrades.deployProxy(LPStaking);
    await lpStaking.deployed();
    await lpStaking.setAddressBook(addressbook.address);
    await addressbook.set("lpStaking", lpStaking.address);
  });
});















describe("test ", () => {
  it("creat pool", async () => {
    var tx = await fakeUSDC.transfer(pool.address, toBigNum("200000000",6));
    await tx.wait();

    var tx = await pool.createLiquidity();
    await tx.wait();

    var pair = await exchangeFactory.getPair(fakeUSDC.address, tokenV1.address);
    pairContract = new ethers.Contract(pair, ERC20ABI, owner);
    console.log(
      "safe LP balance",
      fromBigNum(await pairContract.balanceOf(safe.address))
    );
    console.log(
      "safe USDC balance",
      fromBigNum(await fakeUSDC.balanceOf(safe.address), 6)
    );
  });

  it("mint 1000 FUR token to user1 and user2", async () => {
    var tx = await tokenV1.mint(user1.address, toBigNum("1000"));
    await tx.wait();
    var tx = await tokenV1.mint(user2.address, toBigNum("1000"));
    await tx.wait();

    console.log(
      "safe FUR balance",
      fromBigNum(await tokenV1.balanceOf(safe.address))
    );
    console.log(
      "user1 FUR balance",
      fromBigNum(await tokenV1.balanceOf(user1.address))
    );
    console.log(
      "user2 FUR balance",
      fromBigNum(await tokenV1.balanceOf(user2.address))
    );
  });

  it("user1 transfer 1000 FUR token to user2", async () => {
    var tx = await tokenV1
      .connect(user1)
      .transfer(user2.address, toBigNum("1000"));
    await tx.wait();

    await checkBalance();
    await network.provider.send("evm_increaseTime", [172800]);
    await network.provider.send("evm_mine");
  });

  it("user2 sell 1000 FUR token", async () => {
    var tx = await tokenV1
      .connect(user2)
      .approve(swap.address, toBigNum("1000"));
    await tx.wait;
    var tx = await swap.connect(user2).sell(toBigNum("1000"));
    await tx.wait();

    await checkBalance();
    await network.provider.send("evm_increaseTime", [172800]);
    await network.provider.send("evm_mine");
  });

  it("user1 buy FUR token with 1000 USDC", async () => {
    var tx = await fakeUSDC.transfer(user1.address, toBigNum("1000", 6));
    await tx.wait;
    var tx = await fakeUSDC
      .connect(user1)
      .approve(swap.address, toBigNum("1000", 6));
    await tx.wait;
    var tx = await swap.connect(user1).buy(toBigNum("1000",6));
    await tx.wait();

    await checkBalance();
    await network.provider.send("evm_increaseTime", [172800]);
    await network.provider.send("evm_mine");
  });

  it("user2 buy FUR token with 1000 USDC", async () => {
    var tx = await fakeUSDC.transfer(user2.address, toBigNum("1000", 6));
    await tx.wait;
    var tx = await fakeUSDC
      .connect(user2)
      .approve(swap.address, toBigNum("1000", 6));
    await tx.wait;
    var tx = await swap.connect(user2).buy(toBigNum("1000",6));
    await tx.wait();

    await checkBalance();
  });
});




















// const checkFURBalance = async () => {
//   console.log(
//     "owner FUR balance",
//     fromBigNum(await tokenV1.balanceOf(owner.address))
//   );
//   console.log(
//     "safe FUR balance",
//     fromBigNum(await tokenV1.balanceOf(safe.address))
//   );
//   console.log(
//     "vault FUR balance",
//     fromBigNum(await tokenV1.balanceOf(vault.address))
//   );
//   console.log(
//     "user1 FUR balance",
//     fromBigNum(await tokenV1.balanceOf(user1.address))
//   );
//   console.log(
//     "user2 FUR balance",
//     fromBigNum(await tokenV1.balanceOf(user2.address))
//   );
// };

// const checkLPBalance = async () => {
//   console.log(
//     "owner LP balance",
//     fromBigNum(await pairContract.balanceOf(owner.address))
//   );
//   console.log(
//     "safe LP balance",
//     fromBigNum(await pairContract.balanceOf(safe.address))
//   );
//   console.log(
//     "user1 LP balance",
//     fromBigNum(await pairContract.balanceOf(user1.address))
//   );
//   console.log(
//     "user2 LP balance",
//     fromBigNum(await pairContract.balanceOf(user2.address))
//   );
//   console.log(
//     "lpstaking contract LP balance",
//     fromBigNum(await pairContract.balanceOf(lpStaking.address))
//   );
// };

const checkBalance = async () => {
  console.log(
    "safe FUR balance",
    fromBigNum(await tokenV1.balanceOf(safe.address))
  );
  console.log(
    "safe USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(safe.address), 6)
  );
  console.log(
    "vault FUR balance",
    fromBigNum(await tokenV1.balanceOf(vault.address))
  );
  console.log(
    "user1 FUR balance",
    fromBigNum(await tokenV1.balanceOf(user1.address))
  );
  console.log(
    "user2 FUR balance",
    fromBigNum(await tokenV1.balanceOf(user2.address))
  );
  console.log(
    "lpstaking contract LP balance",
    fromBigNum(await pairContract.balanceOf(lpStaking.address))
  );
};
