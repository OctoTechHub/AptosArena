const { Account, SigningSchemeInput, Ed25519PrivateKey } =require('@aptos-labs/ts-sdk');
// const account = Account.generate({});
// console.log('Generated Account:',account);
// console.log(`Public Key: ${account.publicKey}`);
// console.log(`Private Key: ${account.privateKey}`);
// 0x7644891333e526065ec7e9a4598dd5b7be93c14e6dbee3ad08114c5a4cae9356
// 0xa6065a8cdbe5672965e1e2dff76e3c0fbd6e06982fabb46769a48c7b8289dc26
const privateKey=new Ed25519PrivateKey('0xa6065a8cdbe5672965e1e2dff76e3c0fbd6e06982fabb46769a48c7b8289dc26')
const derieved_account = Account.fromPrivateKey({ privateKey });
console.log('Derieved Account:',derieved_account);
console.log(`Public Key: ${derieved_account.publicKey}`);
console.log(`Private Key: ${derieved_account.privateKey}`);
