import {
    Account,
    Aptos,
    AptosConfig,
    Network,
    SigningSchemeInput,
} from "@aptos-labs/ts-sdk";

const account1 = Account.generate(); // defaults to Legacy Ed25519
// const account2 = Account.generate({ scheme: SigningSchemeInput.Secp256k1 }); // Single Sender Secp256k1
const account3 = Account.generate({
  scheme: SigningSchemeInput.Ed25519,
  legacy: false,
}); // Single Sender Ed25519


console.log(account1.publicKey);
console.log(account1.privateKey);
