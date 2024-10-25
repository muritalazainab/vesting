import hre from "hardhat"
import {time} from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function main() {
    
    
    const [owner, user1, user2] = await hre.ethers.getSigners();

    const amountMintToContract =  hre.ethers.parseUnits("100000000", 18)

    const amountToclaim =   hre.ethers.parseUnits("100000", 18)



    const liskToken = await hre.ethers.getContractFactory("CeloToken");
    const liskTokenTx = await liskToken.deploy(owner.address)


    const tokenVesting = await hre.ethers.getContractFactory("TokenVesting");
    const tokenVestingTx = await tokenVesting.deploy(liskTokenTx);

    

    const tokenVestingInstance = await hre.ethers.getContractAt("TokenVesting", tokenVestingTx);
    const liskTokenInstance = await hre.ethers.getContractAt("LiskToken", liskTokenTx);


    // starting of scripting

    console.log("###### minting celoToken to the vestingToke  contract #######");


    const mintDollarToContract = await liskTokenInstance.connect(owner).mint(tokenVestingInstance.getAddress(),
     amountMintToContract);

    mintDollarToContract.wait();

    console.log({"NairaContractMint": mintDollarToContract});



    console.log("####### Adding Beneficiary ####");


    await tokenVestingInstance.addBeneficiary(user1.address, 60, 120,  amountToclaim);


    console.log("checking user balance before claiming");

    const user1LiskBal = await liskTokenInstance.connect(user1).balanceOf(user1.address);

    console.log({"user1 lisk balance before claim": user1LiskBal.toString()});



    console.log("##### getting user1 releasable amount after 1min of vesting period  #####");

    await time.increaseTo( await time.latest() + 60)

    const user1ReleasableAmount = await tokenVestingInstance.connect(user1).getReleasableAmount(user1.address);

    console.log({"User1 releasable amount": user1ReleasableAmount.toString()});



    console.log("##### user1 claiming after 1min  #####");

    await time.increaseTo( await time.latest() + 1000)

    const claiming1Tx = await tokenVestingInstance.connect(user1).claimTokens();

    claiming1Tx.wait();

    const user1LiskBalAfterClim1 = await liskTokenInstance.connect(user1).balanceOf(user1.address);


    console.log({"user1 balance after  first claiming": user1LiskBalAfterClim1.toString()});


    console.log("### user1 claiming all the the available allocation in time equal or above vesting period ####");

    await time.increaseTo( await time.latest() + 1200)

    const claimingAllTx = await tokenVestingInstance.connect(user1).claimTokens();

    claimingAllTx.wait();

    const user1LiskBalAfterClaimAll = await liskTokenInstance.connect(user1).balanceOf(user1.address);


    console.log({"user1 balance after claiming All": user1LiskBalAfterClaimAll.toString()});
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1
})