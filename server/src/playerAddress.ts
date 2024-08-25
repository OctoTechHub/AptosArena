import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

async function generateAccount(): Promise<string> {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    const account = Account.generate();
    console.log('Generated Account Address:', account.accountAddress);
    return account.accountAddress.toString();
}

export default generateAccount;
