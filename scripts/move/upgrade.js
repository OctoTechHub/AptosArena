require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

async function publish() {
  // Check VITE_MODULE_ADDRESS is set
  if (!process.env.VITE_MODULE_ADDRESS) {
    throw new Error(
      "VITE_MODULE_ADDRESS variable is not set, make sure you have published the module before upgrading it",
    );
  }

  // Check FA_ADDRESS exists
  const aptosConfig = new aptosSDK.AptosConfig({network:process.env.VITE_APP_NETWORK})
  const aptos = new aptosSDK.Aptos(aptosConfig)
  const isFungibleAsset = await aptos.getFungibleAssetMetadataByAssetType({assetType:process.env.VITE_FA_ADDRESS})
    
  if (!isFungibleAsset) {
    throw new Error(
      "Fungible Asset does not exist. Make sure you have set up the correct asset as the VITE_FA_ADDRESS in the .env file",
    );
  }

  // Make sure VITE_REWARD_CREATOR_ADDRESS is set
  if (!process.env.VITE_REWARD_CREATOR_ADDRESS) {
    throw new Error("Please set the VITE_REWARD_CREATOR_ADDRESS in the .env file");
  }

  // Make sure VITE_REWARD_CREATOR_ADDRESS exists
  try {
    await aptos.getAccountInfo({ accountAddress: process.env.VITE_REWARD_CREATOR_ADDRESS });
  } catch (error) {
    throw new Error(
      "Account does not exist. Make sure you have set up the correct address as the VITE_REWARD_CREATOR_ADDRESS in the .env file",
    );
  }

  const move = new cli.Move();

  move.upgradeObjectPackage({
    packageDirectoryPath: "move",
    objectAddress: process.env.VITE_MODULE_ADDRESS,
    namedAddresses: {
      // Upgrade module from an object
      module_addr: process.env.VITE_MODULE_ADDRESS,
    },
      profile: `${process.env.PROJECT_NAME}-${process.env.VITE_APP_NETWORK}`,
  });
}
publish();
