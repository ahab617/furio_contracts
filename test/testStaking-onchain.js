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
let swap;
let token;
let vault;
let addLiquidity;
let lpStaking;

var owner;
var user1;
var user2;
var user3;
var user4;
var user5;
var user6;

var isOnchain = false; //true: bsc testnet, false: hardhat net

var deployedAddress = {
  exchangeFactory: "0xb7926c0430afb07aa7defde6da862ae0bde767bc",
  wBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  exchangeRouter: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
  token: "0xbeEA1e568B75C78611b9af840b68DFF605F853a1",
  fakeUSDC: "0x7F8CE1b5486F24cd4e5CB98e78d306cD71Ea337b",
  fakeUSDT: "0x60c83C6D100C916069B230167c37358dC2997083",
  addressbook: "0x87521B640E2F7B1903a4be20032fd66CabC0EcCd",
  claim: "0x452629e243691CA6BDaf525783F75943FbbF67D0",
  downline: "0xc195f52841ad5cb92b14200eC4419465C30353C1",
  pool: "0x0a9CaCf02693F7cE024E75E59B23fBAc9ee11584",
  swap: "0x0ec88Da2d0a9de9D9D2c2B80F8b4EBa7F7A5b46A",
  vault: "0x92f087E7e2420f179b570E6719868a50078F941d",
  addLiquidity: "0xAcE453642cbE492ad874669ad313840f8Ab672cA",
  lpStaking: "0x48269452BD2F6c6882d3a5bce2C769DE977351a2",
};

/**
 * USDC-FUR LP:    0xCd2a436B8d42B4cc82Fc31dA5BD85818F3D97E04
  USDC-BNB LP:	   0x0dA7F314aF09Ac11B5621EfAF3893112225d5F63
  USDC-USDT LP:	   0x8602c9dAbDD2C73F57D6563a398D252a2f7c1557
 */

  /**
   *owner 	0x5a0f19cE6eE22De387BF4ff308ecF091A91C3a5E
    safe 	0xCF020c184602073Fe0E0b242F96389267F283adE
    user1 	0x882Cc95439b8129526805f5438494BeFacDa21d9
    user2 	0x067522f6ef963768Ad49e66a0eC2f9C117990742
    lpLockReceiver 0x067522f6ef963768Ad49e66a0eC2f9C117990742
   */
///////////********* create account and contract deploy and set ********////////////////////

describe("Create Account and wallet", () => {
  it("Create Wallet", async () => {
    [owner, safe, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();
    console.log("owner", owner.address);
    console.log("safe", safe.address);
    console.log("user1", user1.address);
    console.log("user2", user2.address);
  });
});

describe("Contracts deploy", () => {
  // ------ dex deployment ------- //
  it("Factory deploy", async () => {
    const Factory = await ethers.getContractFactory("PancakeFactory");
    if (!isOnchain) {
      exchangeFactory = await Factory.deploy(owner.address);
      await exchangeFactory.deployed();
      console.log(await exchangeFactory.INIT_CODE_PAIR_HASH());
    } else {
      exchangeFactory = Factory.attach(deployedAddress.exchangeFactory);
    }
    console.log("Factory", exchangeFactory.address);
  });

  it("WBNB deploy", async () => {
    const WBNB_ = await ethers.getContractFactory("WBNB");
    if (!isOnchain) {
      wBNB = await WBNB_.deploy();
      await wBNB.deployed();
    } else {
      wBNB = WBNB_.attach(deployedAddress.wBNB);
    }
    console.log("WBNB", wBNB.address);
  });

  it("Router deploy", async () => {
    const Router = await ethers.getContractFactory("PancakeRouter");
    if (!isOnchain) {
      exchangeRouter = await Router.deploy(
        exchangeFactory.address,
        wBNB.address
      );
      await exchangeRouter.deployed();
    } else {
      exchangeRouter = Router.attach(deployedAddress.exchangeRouter);
    }
    console.log("Router", exchangeRouter.address);
  });

  it("Token deploy", async () => {
    Token = await ethers.getContractFactory("Token");
    TokenV1 = await ethers.getContractFactory("TokenV1");

    if (!isOnchain) {
        token = await upgrades.deployProxy(Token);
        await token.deployed();
        token = await upgrades.upgradeProxy(token.address, TokenV1);
        await token.deployed();
    } else {
      token = TokenV1.attach(deployedAddress.token);
    }
    console.log("token", token.address);
  });

  // ------ dex deployment ------- //
  it("FakeUSDC deploy", async () => {
    const FakeUSDC = await ethers.getContractFactory("FakeUsdc");
    if (!isOnchain) {
      fakeUSDC = await FakeUSDC.deploy();
      await fakeUSDC.deployed();
    } else {
      fakeUSDC = FakeUSDC.attach(deployedAddress.fakeUSDC);
    }
    console.log("fakeUSDC", fakeUSDC.address);
  });

  it("FakeUSDT deploy", async () => {
    const FakeUSDT = await ethers.getContractFactory("FakeUsdt");
    if (!isOnchain) {
      fakeUSDT = await FakeUSDT.deploy();
      await fakeUSDT.deployed();
    } else {
      fakeUSDT = FakeUSDT.attach(deployedAddress.fakeUSDT);
    }
    console.log("fakeUSDT", fakeUSDT.address);
  });

  it("AddressBook deploy", async () => {
    AddressBook = await ethers.getContractFactory("AddressBook");
    if (!isOnchain) {
      addressbook = await upgrades.deployProxy(AddressBook);
      await addressbook.deployed();

      var tx = await addressbook.set("safe", safe.address);
      await tx.wait();
      var tx = await addressbook.set("payment", fakeUSDC.address);
      await tx.wait();
      var tx = await addressbook.set("router", exchangeRouter.address);
      await tx.wait();
      var tx = await addressbook.set("factory", exchangeFactory.address);
      await tx.wait();
      var tx = await addressbook.set("lpLockReceiver", safe.address);
      await tx.wait();
    } else {
      addressbook = AddressBook.attach(deployedAddress.addressbook);
    }
    console.log("AddressBook", addressbook.address);
  });

  it("Claim deploy", async () => {
    Claim = await ethers.getContractFactory("Claim");
    if (!isOnchain) {
      claim = await upgrades.deployProxy(Claim);
      await claim.deployed();
      var tx = await claim.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("claim", claim.address);
      await tx.wait();
    } else {
      claim = Claim.attach(deployedAddress.claim);
    }
    console.log("claim", claim.address);
  });

  it("Downline deploy", async () => {
    Downline = await ethers.getContractFactory("Downline");
    if (!isOnchain) {
      downline = await upgrades.deployProxy(Downline);
      await downline.deployed();
      var tx = await downline.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("downline", downline.address);
      await tx.wait();
    } else {
      downline = Downline.attach(deployedAddress.downline);
    }
    console.log("downline", downline.address);
  });

  it("Pool deploy", async () => {
    Pool = await ethers.getContractFactory("Pool");
    if (!isOnchain) {
      pool = await upgrades.deployProxy(Pool);
      await pool.deployed();
      var tx = await pool.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("pool", pool.address);
      await tx.wait();
    } else {
      pool = Pool.attach(deployedAddress.pool);
    }
    console.log("pool", pool.address);
  });

  it("Swap deploy and set", async () => {
    Swap = await ethers.getContractFactory("Swap");
    if (!isOnchain) {
      swap = await upgrades.deployProxy(Swap);
      await swap.deployed();
      var tx = await swap.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("swap", swap.address);
      await tx.wait();
    } else {
      swap = Swap.attach(deployedAddress.swap);
    }
    console.log("swap", swap.address);
  });

  it("Token set and get pair", async () => {
    if (!isOnchain) {
      var tx = await token.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("token", token.address);
      await tx.wait();
    } else {
    }
  });

  it("Vault deploy and set", async () => {
    Vault = await ethers.getContractFactory("Vault");
    if (!isOnchain) {
      vault = await upgrades.deployProxy(Vault);
      await vault.deployed();
      var tx = await vault.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("vault", vault.address);
      await tx.wait();
    } else {
      vault = Vault.attach(deployedAddress.vault);
    }
    console.log("vault", vault.address);
  });

  it("AddLiquidity deploy and set", async () => {
    Addliquidity = await ethers.getContractFactory("AddLiquidity");
    if (!isOnchain) {
      addLiquidity = await upgrades.deployProxy(Addliquidity);
      await addLiquidity.deployed();
      var tx = await addLiquidity.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("addLiquidity", addLiquidity.address);
      await tx.wait();
    } else {
      addLiquidity = Addliquidity.attach(deployedAddress.addLiquidity);
    }
    console.log("addLiquidity", addLiquidity.address);
  });

  it("LPStaking deploy and set", async () => {
    LPStaking = await ethers.getContractFactory("LPStaking");
    LPStakingV1 = await ethers.getContractFactory("LPStakingV1");

    if (!isOnchain) {
      lpStaking = await upgrades.deployProxy(LPStaking);
      await lpStaking.deployed();
      var tx = await upgrades.upgradeProxy(lpStaking.address, LPStakingV1);
      await tx.wait();
      var tx = await lpStaking.setAddressBook(addressbook.address);
      await tx.wait();
      var tx = await addressbook.set("lpStaking", lpStaking.address);
      await tx.wait();

      var tx = await addressbook.set("lpLockReceiver", safe.address);
      await tx.wait();

      /************* set path **************/
      var tx = await lpStaking.setSwapPathFromTokenToUSDC(fakeUSDT.address, [
        fakeUSDT.address,
        fakeUSDC.address,
      ]);
      await tx.wait();

    } else {
      lpStaking = LPStaking.attach(deployedAddress.lpStaking);
    }
    console.log("lpStaking", lpStaking.address);
  });
});

//*********************************** create pool and send some cryto to accounts **************************************************//
describe("create pool ", () => {
  it("creat USDC-FUR pool", async () => {
    if (!isOnchain) {
      var tx = await fakeUSDC.transfer(pool.address, toBigNum("1111368", 18));
      await tx.wait();

      var tx = await pool.createLiquidity();
      await tx.wait();

      var pair = await exchangeFactory.getPair(fakeUSDC.address, token.address);
      pairContract = new ethers.Contract(pair, ERC20ABI, owner);
      console.log("pair", pairContract.address);
    }

  });

  it("creat USDC-USDT pool", async () => {
    if (!isOnchain) {
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
    } else {
    }
  });

  it("create USDC-BNB pool", async () => {
    if (!isOnchain) {
      var tx = await fakeUSDC.approve(
        exchangeRouter.address,
        toBigNum("10000", 18)
      );
      await tx.wait();

      var tx = await exchangeRouter.addLiquidityETH(
        fakeUSDC.address,
        toBigNum("10000", 18),
        0,
        0,
        owner.address,
        "1234325432314321",
        { value: ethers.utils.parseUnits("0.5", 18) }
      );
      await tx.wait();
    }
  });

});



describe("test", () => {
  //make lpstaking contract eviroment now
  it("transfer USDC to lpStaking contract", async () => {
    var tx = await fakeUSDC.transfer(
      user1.address,
      ethers.utils.parseUnits("100000", 18)
    );
    await tx.wait();
  });
  it("owner send 150 LP to user4", async () => {
    if (!isOnchain) {
      var tx = await pairContract.connect(safe).transfer(user4.address, toBigNum("150", 18));
      await tx.wait();
    }
  });


  it("owner send 30 LP to user5 and register address", async () => {
    if (!isOnchain) {
      var tx = await pairContract.connect(safe).transfer(user5.address, toBigNum("30", 18));
      await tx.wait();
    }
  });

  it("owner send 10 LP to user6 and register address", async () => {
    if (!isOnchain) {
      var tx = await pairContract.connect(safe).transfer(user6.address, toBigNum("10", 18));
      await tx.wait();
    }
  });


  it("user1 stake LP with USDC for two month", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user1.address,
        ethers.utils.parseUnits("1000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user1)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user1.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user1)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user1.address), 2);
      await tx.wait();
    }
  });
  it("user1 stake LP with USDT for two month", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user1.address, toBigNum("11113", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user1)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user1.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user1)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user1.address), 2);
    await tx.wait();
    }
  });
  it("owner stake LP with BNB for three month", async () => {
    if (!isOnchain) {
      //stake
      var tx = await lpStaking
      .stakeWithEth(ethers.utils.parseUnits("0.05", 18),
       3,
      {value: ethers.utils.parseUnits("0.05", 18)}
      );      
      await tx.wait();
    }
  });
  it("owner stake LP with Fur for three month", async () => {
    if (!isOnchain) {
      //mint
      var tx = await token.mint(owner.address, toBigNum("100", 18));
      await tx.wait();

      //approve
      var tx = await token
        .approve(lpStaking.address, toBigNum("100", 18));
      await tx.wait();

      //stake
      var tx = await lpStaking
          .stake(token.address, toBigNum("100", 18), 3);
      await tx.wait();
    }
  });

  // it("check owner remaining staked lock time ", async () => {
  //   if (!isOnchain) {
  //   console.log("owner remaining staked lock time", fromBigNum(await lpStaking.getRemainingLockedTime(owner.address), 0));
  //   }
  // });
  // it("owner reset staking duration ", async () => {
  //   if (!isOnchain) {
  //     var tx = await lpStaking.resetStakingPeriod(3);
  //     await tx.wait();

  //     // await network.provider.send("evm_increaseTime", [86400]);
  //     // await network.provider.send("evm_mine");
  //   }
  // });
  // it("check owner remaining staked lock time ", async () => {
  //   if (!isOnchain) {
  //   console.log("owner remaining staked lock time", fromBigNum(await lpStaking.getRemainingLockedTime(owner.address), 0));
  //   }
  // });


  it("user2 stake LP with USDC", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user2.address,
        ethers.utils.parseUnits("2000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user2)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user2.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user2)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user2.address), 0);
      await tx.wait();

       await network.provider.send("evm_increaseTime", [86400]);
       await network.provider.send("evm_mine");
    }
  });
  it("user3 stake LP with USDT", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user3.address, toBigNum("1110", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user3)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 0);
    await tx.wait();
  
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    }
  });


  it("user5 send all LP to user4", async () => {
    if (!isOnchain) {
      var tx = await pairContract.connect(user5).transfer(user4.address,  pairContract.balanceOf(user5.address));
      await tx.wait();
    }
  });
  it("user6 send all LP to user4", async () => {
    var tx = await pairContract.connect(user6).transfer(user4.address,  pairContract.balanceOf(user6.address));
    await tx.wait();
  });


  it("user2 stake LP with USDC", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user2.address,
        ethers.utils.parseUnits("2000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user2)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user2.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user2)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user2.address), 0);
      await tx.wait();

       await network.provider.send("evm_increaseTime", [86400]);
       await network.provider.send("evm_mine");
    }
  });
  // it("owner send 10 LP to user5 and register address", async () => {
  //   if (!isOnchain) {
  //     var tx = await pairContract.connect(safe).transfer(user5.address, toBigNum("30", 18));
  //     await tx.wait();
  //     var tx = await lpStaking.connect(user5).registerAddress();
  //     await tx.wait();
  //   }
  // });
  // it("owner send 30 LP to user6 and register address", async () => {
  //   if (!isOnchain) {
  //     var tx = await pairContract.connect(safe).transfer(user6.address, toBigNum("30", 18));
  //     await tx.wait();
  //     var tx = await lpStaking.connect(user6).registerAddress();
  //     await tx.wait();
  //   }
  // });
  it("user3 stake LP with USDT", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user3.address, toBigNum("1110", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user3)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 0);
    await tx.wait();
  
    }
  });
  it("reflection check", async () => {
    console.log("reflection check (user5 usdc)", fromBigNum(await fakeUSDC.balanceOf(user5.address), 18));
    console.log("user5 LP balance",fromBigNum(await pairContract.balanceOf(user5.address), 18));
    console.log("reflection check (user6 usdc)", fromBigNum(await fakeUSDC.balanceOf(user6.address), 18));
    console.log("user6 LP balance",fromBigNum(await pairContract.balanceOf(user6.address), 18));
  });


  it("user2 stake LP with USDC", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user2.address,
        ethers.utils.parseUnits("2000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user2)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user2.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user2)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user2.address), 0);
      await tx.wait();

       await network.provider.send("evm_increaseTime", [86400]);
       await network.provider.send("evm_mine");
    }
  });
  it("user3 stake LP with USDT", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user3.address, toBigNum("1110", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user3)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 0);
    await tx.wait();
  
    }
  });

  it("user2 stake LP with USDC", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user2.address,
        ethers.utils.parseUnits("2000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user2)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user2.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user2)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user2.address), 0);
      await tx.wait();

       await network.provider.send("evm_increaseTime", [86400]);
       await network.provider.send("evm_mine");
    }
  });
  it("user3 stake LP with USDT", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user3.address, toBigNum("1110", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user3)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 0);
    await tx.wait();
  
    }
  });

  it("user2 stake LP with USDC", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user2.address,
        ethers.utils.parseUnits("2000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user2)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user2.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user2)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user2.address), 0);
      await tx.wait();

       await network.provider.send("evm_increaseTime", [86400]);
       await network.provider.send("evm_mine");
    }
  });
  it("user3 stake LP with USDT", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user3.address, toBigNum("1110", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user3)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 0);
    await tx.wait();
  
    }
  });

  it("user2 stake LP with USDC", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDC.transfer(
        user2.address,
        ethers.utils.parseUnits("2000", 18)
      );
      await tx.wait();

        //approve
      var tx = await fakeUSDC
        .connect(user2)
        .approve(lpStaking.address, fakeUSDC.balanceOf(user2.address));
      await tx.wait();

        //stake
      var tx = await lpStaking
        .connect(user2)
        .stake(fakeUSDC.address, fakeUSDC.balanceOf(user2.address), 0);
      await tx.wait();

       await network.provider.send("evm_increaseTime", [86400]);
       await network.provider.send("evm_mine");
    }
  });
  it("user3 stake LP with USDT", async () => {
    if (!isOnchain) {
      //transfer
      var tx = await fakeUSDT.transfer(user3.address, toBigNum("1110", 6));
      await tx.wait();

      //approve
      var tx = await fakeUSDT
        .connect(user3)
        .approve(lpStaking.address, fakeUSDT.balanceOf(user3.address));
      await tx.wait();

      //stake
      var tx = await lpStaking
      .connect(user3)
      .stake(fakeUSDT.address, fakeUSDT.balanceOf(user3.address), 0);
    await tx.wait();
  
    }
  });
});
