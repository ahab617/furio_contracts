const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const EthCrypto = require("eth-crypto");
const { toBigNum, fromBigNum } = require("./utils.js");

var ERC20ABI = artifacts.readArtifactSync("contracts/FakeUsdc.sol:IERC20").abi;
var pairContract;
var exchangeRouter;
var exchangeFactory;
let wBNB;
let fakeUSDC;
let fakeUSDT;

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
let addLiquidity;
let lpStaking;
let LPStakingV2;

var owner;
var safe;
var user1;
var user2;
var lpLockReceiver;

///////////********* create account and contract deploy and set ********////////////////////

describe("Create Account and wallet", () => {
  it("Create Wallet", async () => {
    [owner, safe, user1, user2, user3] = await ethers.getSigners();

    lpLockReceiver = ethers.Wallet.createRandom();
    lpLockReceiver = lpLockReceiver.connect(ethers.provider);
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
    const FakeUSDC = await ethers.getContractFactory("FakeUsdc");
    fakeUSDC = await FakeUSDC.deploy();
    await fakeUSDC.deployed();
  });

  it("FakeUSDT deploy", async () => {
    const FakeUSDT = await ethers.getContractFactory("FakeUsdt");
    fakeUSDT = await FakeUSDT.deploy();
    await fakeUSDT.deployed();
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
    // console.log(token.address," token/proxy")
    // console.log(await upgrades.erc1967.getImplementationAddress(token.address)," getImplementationAddress")
    // console.log(await upgrades.erc1967.getAdminAddress(token.address), " getAdminAddress")
    tokenV1 = await upgrades.upgradeProxy(token.address, TokenV1);
    // console.log(TokenV1.address," tokenV1/proxy after upgrade")
    // console.log(await upgrades.erc1967.getImplementationAddress(tokenV1.address)," getImplementationAddress after upgrade")
    // console.log(await upgrades.erc1967.getAdminAddress(tokenV1.address)," getAdminAddress after upgrade")
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

  it("AddLiquidity deploy and set", async () => {
    Addliquidity = await ethers.getContractFactory("AddLiquidity");
    addLiquidity = await upgrades.deployProxy(Addliquidity);
    await addLiquidity.deployed();
    await addLiquidity.setAddressBook(addressbook.address);
    await addressbook.set("addLiquidity", addLiquidity.address);
  });

  it("LPStakingV1 deploy and set", async () => {
    LPStakingV1 = await ethers.getContractFactory("LPStakingV1");

    lpStaking = await upgrades.deployProxy(LPStakingV1);
    await lpStaking.deployed();

    await lpStaking.setAddressBook(addressbook.address);
    await addressbook.set("lpStaking", lpStaking.address);
    await addressbook.set("lpLockReceiver", lpLockReceiver.address);

    /************* set path **************/
    await lpStaking.setSwapPathFromTokenToUSDC(fakeUSDT.address, [
      fakeUSDT.address,
      fakeUSDC.address,
    ]);

  });
});

//*********************************** create pool and send some cryto to accounts **************************************************//
describe("test prepare ", () => {
  it("creat USDC-FUR pool", async () => {
    var tx = await fakeUSDC.transfer(pool.address, toBigNum("1111368", 18));
    await tx.wait();

    var tx = await pool.createLiquidity();
    await tx.wait();

    var pair = await exchangeFactory.getPair(fakeUSDC.address, tokenV1.address);
    pairContract = new ethers.Contract(pair, ERC20ABI, owner);
  });

  it("creat USDC-USDT pool", async () => {
    var tx = await fakeUSDT.approve(
      exchangeRouter.address,
      toBigNum("100000", 6)
    );
    await tx.wait();

    var tx = await fakeUSDC.approve(
      exchangeRouter.address,
      toBigNum("100000", 18)
    );
    await tx.wait();

    var tx = await exchangeRouter.addLiquidity(
      fakeUSDC.address,
      fakeUSDT.address,
      toBigNum("100000", 18),
      toBigNum("100000", 6),
      0,
      0,
      owner.address,
      "1234325432314321"
    );
    await tx.wait();
  });

  it("create USDC-BNB pool", async () => {
    var tx = await fakeUSDC.approve(
      exchangeRouter.address,
      toBigNum("1000000", 18)
    );
    await tx.wait();

    var tx = await exchangeRouter.addLiquidityETH(
      fakeUSDC.address,
      toBigNum("1000000", 18),
      0,
      0,
      owner.address,
      "1234325432314321",
      { value: ethers.utils.parseUnits("5000", 18) }
    );
    await tx.wait();
  });

  it("send USDC to user1, user2, user3", async () => {
    var tx = await fakeUSDC.transfer(user1.address, toBigNum("10000", 18));
    await tx.wait();
    var tx = await fakeUSDC.transfer(user2.address, toBigNum("10000", 18));
    await tx.wait();
    var tx = await fakeUSDC.transfer(user3.address, toBigNum("10000", 18));
    await tx.wait();
  });

  it("send USDT to user1, user2, user3", async () => {
    var tx = await fakeUSDT.transfer(user1.address, toBigNum("10000", 6));
    await tx.wait();
    var tx = await fakeUSDT.transfer(user2.address, toBigNum("10000", 6));
    await tx.wait();
    var tx = await fakeUSDT.transfer(user3.address, toBigNum("10000", 6));
    await tx.wait();
  });

  it("mint 500 FUR tokens to owner, user1, user2, user3", async () => {
    var tx = await tokenV1.mint(owner.address, toBigNum("500"));
    await tx.wait();
    var tx = await tokenV1.mint(user1.address, toBigNum("500"));
    await tx.wait();
    var tx = await tokenV1.mint(user2.address, toBigNum("500"));
    await tx.wait();
    var tx = await tokenV1.mint(user3.address, toBigNum("500"));
    await tx.wait();
  });

  // it("check Owner and Safe balance", async () => {
  //   await checkOwnerandSafeBalance();
  // });

  // it("check Fur balance", async () => {
  //   await checkFurBalance();
  // });

  // it("check LP balance", async () => {
  //   await checkLPBalance();
  // });

  // it("check BNB balance", async () => {
  //   await checkBNBBalance();
  // });

  // it("check USDT balance", async () => {
  //   await checkUSDTBalance();
  // });

  // it("check USDC balance", async () => {
  //   await checkUSDCBalance();
  // });
});

//***************************************** test all functionality (please check safe wallet usdc amount for reflection)**************************************************//
describe("test", () => {

  //******************** user1 stake LP with USDC **********************/
  it("approve user1 USDC to LPstaking contract", async () => {
    var tx = await fakeUSDC
      .connect(user1)
      .approve(lpStaking.address, fakeUSDC.balanceOf(user1.address));
    await tx.wait();
  });

  it("user1 stake with USDC", async () => {
    var tx = await lpStaking
      .connect(user1)
      .stake(fakeUSDC.address, fakeUSDC.balanceOf(user1.address), 0);
    await tx.wait();
  });

  // it("check USDC balance", async () => {
  //   await checkUSDCBalance();
  // });

  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  //***************    user2 stake LP with BNB for a month ***************************/

  it("user2 stake with BNB for a month", async () => {
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    var tx = await lpStaking
      .connect(user2)
      .stakeWithEth(ethers.utils.parseUnits("10", 18), 1, {
        value: ethers.utils.parseUnits("10", 18),
      });
    await tx.wait();
  });

  // it("check BNB balance", async () => {
  //   await checkBNBBalance();
  // });

  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  //***************    user3 stake LP with USDT for two months  ***************************/
  it("approve user3 USDT to LPstaking contract", async () => {
    var tx = await fakeUSDT
      .connect(user3)
      .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
    await tx.wait();
  });

  it("user3 stake with USDT for three month", async () => {
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 3);
    await tx.wait();
  });

  // it("check USDT balance", async () => {
  //   await checkUSDTBalance();
  // });

  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  ///////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////   Upgrade   ///////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////
  it("upgrade LPStakingV1 to V2", async () => {
        //upgrade
        LPStakingV2 = await ethers.getContractFactory("LPStakingV2");
        await upgrades.upgradeProxy(lpStaking.address, LPStakingV2);
  });


  //***************    user3 stake LP with $Fur for three months  ***************************/
  it("approve user3 Fur to LPstaking contract", async () => {
    var tx = await tokenV1
      .connect(user3)
      .approve(lpStaking.address, tokenV1.balanceOf(user3.address));
    await tx.wait();
  });

  it("user3 stake with Fur for two month", async () => {
    var tx = await lpStaking
      .connect(user3)
      .stake(tokenV1.address, tokenV1.balanceOf(user3.address), 3);
    await tx.wait();
  });

  // it("check $Fur balance", async () => {
  //   await checkFURBalance();
  // });

  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  //***************    user2 stake LP with USDT ***************************/
  it("approve user2 USDT to LPstaking contract", async () => {
    var tx = await fakeUSDT
      .connect(user2)
      .approve(lpStaking.address, fakeUSDT.balanceOf(user2.address));
    await tx.wait();
  });

  it("user2 stake with USDT", async () => {
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    var tx = await lpStaking
      .connect(user2)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user2.address), 1);
    await tx.wait();
  });

  // it("check USDT balance", async () => {
  //   await checkUSDTBalance();
  // });

  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });


  //********************* check pending rewards and compound, claim functionality ********************//
  // it("check  pending rewards", async () => {
  //   await checkPendingRewards();
  // });

  it("user1 Reward claim", async () => {
    var tx = await lpStaking.connect(user1).claimRewards();
    await tx.wait();
  });
  // it("check USDC balance", async () => {
  //   await checkUSDCBalance();
  // });

  it("user3 LP Reward compound", async () => {
    var tx = await lpStaking.connect(user3).compound();
    await tx.wait();
  });
  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  it("user1 unstake", async () => {
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    var tx = await lpStaking.connect(user1).unstake();
    await tx.wait();
  });
  // it("check USDC balance", async () => {
  //   await checkUSDCBalance();
  // });
  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  it("user2 unstake", async () => {
    await network.provider.send("evm_increaseTime", [2592000]);
    await network.provider.send("evm_mine");
    var tx = await lpStaking.connect(user2).unstake();
    await tx.wait();
  });
  // it("check USDC balance", async () => {
  //   await checkUSDCBalance();
  // });
  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });

  it("user3 unstake", async () => {
    await network.provider.send("evm_increaseTime", [7776000]);
    await network.provider.send("evm_mine");
    var tx = await lpStaking.connect(user3).unstake();
    await tx.wait();
  });
  // it("check USDC balance", async () => {
  //   await checkUSDCBalance();
  // });
  // it("check Staking LP balance", async () => {
  //   await checkStakingLPBalance();
  // });
});

const checkOwnerandSafeBalance = async () => {
  var provider = ethers.provider;
  console.log(
    "owner WBNB balance",
    fromBigNum(await provider.getBalance(owner.address), 18)
  );
  console.log(
    "owner USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(owner.address), 18)
  );
  console.log(
    "owner USDT balance",
    fromBigNum(await fakeUSDT.balanceOf(owner.address), 6)
  );
  console.log(
    "owner LP balance",
    fromBigNum(await pairContract.balanceOf(owner.address), 18)
  );

  console.log(
    "safe LP balance",
    fromBigNum(await pairContract.balanceOf(safe.address), 18)
  );
  console.log(
    "safe USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(safe.address), 18));
};

const checkFurBalance = async () => {
  console.log(
    "owner FUR balance",
    fromBigNum(await tokenV1.balanceOf(owner.address))
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
    "user3 FUR balance",
    fromBigNum(await tokenV1.balanceOf(user3.address))
  );
};

const checkBNBBalance = async () => {
  console.log(
    "owner BNB balance",
    fromBigNum(await ethers.provider.getBalance(owner.address), 18)
  );

  console.log(
    "user1 BNB balance",
    fromBigNum(await ethers.provider.getBalance(user1.address), 18)
  );
  console.log(
    "user2 BNB balance",
    fromBigNum(await ethers.provider.getBalance(user2.address), 18)
  );
  console.log(
    "user3 BNB balance",
    fromBigNum(await ethers.provider.getBalance(user3.address), 18)
  );
};

const checkUSDCBalance = async () => {
  console.log(
    "safe USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(safe.address), 6)
  );

  console.log(
    "owner USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(owner.address), 18)
  );
  console.log(
    "user1 USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(user1.address), 18)
  );
  console.log(
    "user2 USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(user2.address), 18)
  );
  console.log(
    "user3 USDC balance",
    fromBigNum(await fakeUSDC.balanceOf(user3.address), 18)
  );
};

const checkUSDTBalance = async () => {
  console.log(
    "owner USDT balance",
    fromBigNum(await fakeUSDT.balanceOf(owner.address), 6)
  );
  console.log(
    "user1 USDT balance",
    fromBigNum(await fakeUSDT.balanceOf(user1.address), 6)
  );
  console.log(
    "user2 USDT balance",
    fromBigNum(await fakeUSDT.balanceOf(user2.address), 6)
  );
  console.log(
    "user3 USDT balance",
    fromBigNum(await fakeUSDT.balanceOf(user3.address), 6)
  );
};

const checkFURBalance = async () => {
  console.log(
    "owner FUR balance",
    fromBigNum(await tokenV1.balanceOf(owner.address), 18)
  );
  console.log(
    "user1 FUR balance",
    fromBigNum(await tokenV1.balanceOf(user1.address), 18)
  );
  console.log(
    "user2 FUR balance",
    fromBigNum(await tokenV1.balanceOf(user2.address), 18)
  );
  console.log(
    "user3 FUR balance",
    fromBigNum(await tokenV1.balanceOf(user3.address), 18)
  );
};

const checkLPBalance = async () => {
  console.log(
    "safe LP balance",
    fromBigNum(await pairContract.balanceOf(safe.address), 18)
  );
  console.log(
    "user1 LP balance",
    fromBigNum(await pairContract.balanceOf(user1.address), 18)
  );
  console.log(
    "user2 LP balance",
    fromBigNum(await pairContract.balanceOf(user2.address), 18)
  );
  console.log(
    "user3 LP balance",
    fromBigNum(await pairContract.balanceOf(user3.address), 18)
  );
  console.log(
    "lpLockReceiver LP balance",
    fromBigNum(await pairContract.balanceOf(lpLockReceiver.address), 18)
  );
};

const checkStakingLPBalance = async () => {
  console.log(
    "contract LP balance",
    fromBigNum(await pairContract.balanceOf(lpStaking.address), 18)
  );
  console.log(
    "totalStaking LP amount",
    fromBigNum(await lpStaking.totalStakingAmount(), 18)
  );

  let ownerStakingData = await lpStaking.stakers(owner.address);
  console.log(
    "owner Staking LP amount",
    fromBigNum(ownerStakingData.stakingAmount, 18)
  );

  let user1StakingData = await lpStaking.stakers(user1.address);
  console.log(
    "user1 Staking LP amount",
    fromBigNum(user1StakingData.stakingAmount, 18)
  );

  let user2StakingData = await lpStaking.stakers(user2.address);
  console.log(
    "user2 Staking LP amount",
    fromBigNum(user2StakingData.stakingAmount, 18)
  );

  let user3StakingData = await lpStaking.stakers(user3.address);
  console.log(
    "user3 Staking LP amount",
    fromBigNum(user3StakingData.stakingAmount, 18)
  );
};

const checkPendingRewards = async () => {
  console.log(
    "user1 pending reward",
    fromBigNum(await lpStaking.pendingReward(user1.address))
  );
  console.log(
    "user2 pending reward",
    fromBigNum(await lpStaking.pendingReward(user2.address))
  );
  console.log(
    "user3 pending reward",
    fromBigNum(await lpStaking.pendingReward(user3.address))
  );
};
