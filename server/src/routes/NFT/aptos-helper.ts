import { AptosClient, AptosAccount, FaucetClient } from "aptos";

const aptosNodeUrl = "https://fullnode.devnet.aptoslabs.com/v1";
const faucetUrl = "https://faucet.devnet.aptoslabs.com";

const client = new AptosClient(aptosNodeUrl);
const faucetClient = new FaucetClient(aptosNodeUrl, faucetUrl);

export async function createAccount(): Promise<AptosAccount> {
    const account = new AptosAccount();
    await faucetClient.fundAccount(account.address(), 100_000_000);
    console.log(`Account Created: ${account.address()}`);
    return account;
}

export async function createCollection(creator: AptosAccount, collectionName: string, description: string, uri: string) {
    const createCollectionPayload = {
        type: "entry_function_payload",
        function: "0x1::Token::create_collection_script",
        arguments: [collectionName, description, uri, "0", "0"],
        type_arguments: []
    };

    const txnRequest = await client.generateTransaction(creator.address(), createCollectionPayload);
    const signedTxn = await client.signTransaction(creator, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    console.log(`Collection Created: ${collectionName}`);
}

export async function mintToken(creator: AptosAccount, collectionName: string, tokenName: string, description: string, uri: string) {
    const mintTokenPayload = {
        type: "entry_function_payload",
        function: "0x1::Token::create_token_script",
        arguments: [collectionName, tokenName, description, "1", uri, "0"],
        type_arguments: []
    };

    const txnRequest = await client.generateTransaction(creator.address(), mintTokenPayload);
    const signedTxn = await client.signTransaction(creator, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    console.log(`Token Minted: ${tokenName}`);
}

export async function transferToken(from: AptosAccount, to: string, tokenDataId: string) {
    const transferPayload = {
        type: "entry_function_payload",
        function: "0x1::Token::offer_script",
        arguments: [to, tokenDataId, "1"],
        type_arguments: []
    };

    const txnRequest = await client.generateTransaction(from.address(), transferPayload);
    const signedTxn = await client.signTransaction(from, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    console.log(`Token Transferred to ${to}`);
}

export async function getCollectionData(creatorAddress: string, collectionName: string) {
    const collectionData = await client.getTableItem(creatorAddress, {
        key_type: "0x1::Token::Collection",
        value_type: "0x1::Token::CollectionData",
        key: collectionName
    });
    return collectionData;
}
