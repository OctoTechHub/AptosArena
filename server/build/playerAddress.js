"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
function generateAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = new ts_sdk_1.AptosConfig({ network: ts_sdk_1.Network.TESTNET });
        const aptos = new ts_sdk_1.Aptos(config);
        const account = ts_sdk_1.Account.generate();
        console.log('Generated Account Address:', account.accountAddress);
        return account.accountAddress.toString();
    });
}
exports.default = generateAccount;
