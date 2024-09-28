import { createAccount, createCollection, mintToken, transferToken, getCollectionData } from './aptos-helper';

async function main() {
    // Create Alice's account
    const alice = await createAccount();

    // Create Bob's account
    const bob = await createAccount();

    // Create a collection
    const collectionName = "Art Collection";
    const collectionDescription = "This is a unique collection of digital artwork.";
    const collectionUri = "https://example-collection.com";
    await createCollection(alice, collectionName, collectionDescription, collectionUri);

    // Mint a token in the collection
    const tokenName = "Mona Lisa";
    const tokenDescription = "An iconic piece of art.";
    const tokenUri = "https://example-token.com";
    await mintToken(alice, collectionName, tokenName, tokenDescription, tokenUri);

    // Fetch collection data for verification
    const collectionData = await getCollectionData(alice.address().toString(), collectionName);
    console.log(`Collection Data: ${JSON.stringify(collectionData)}`);

    // Transfer the token from Alice to Bob
    const tokenDataId = `${alice.address()}::${collectionName}::${tokenName}`;
    await transferToken(alice, bob.address().toString(), tokenDataId);

    console.log("NFT Transfer Complete.");
}

main().catch(console.error);
