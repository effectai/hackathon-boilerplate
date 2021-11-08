// import effectjs from '@effectai/effect-js'
import Web3 from 'web3/dist/web3.min.js';
import _ from 'lodash';

console.log('Live from main.js!🎆🎆🎆');

document.getElementById('btn-print').onclick = () => {
    console.log('Creating SDK...')
    console.log(JSON.stringify(effectjs))
    const sdkConfig = { 
        network: 'kylin', 
        host: 'https://api.kylin.alohaeos.com:443', 
        // JsSignatureProvider: jsSignatureProvider,
        // web3: w3
    };
    const sdk = new effectjs.EffectClient('testnet', sdkConfig)
    console.log(sdk)   
}

document.getElementById('btn-other').onclick = () => {
    console.log('saving...')
    const joined = _.join(['a', 'b'], '~')
    console.log(joined)
}

document.getElementById('btn-key').onclick = () => {
    console.log('generating key...')

    const rpc = 'https://bsc-dataseed1.ninicoin.io/'
    const w3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account = w3.eth.accounts.create(1)
    
    console.log(JSON.stringify(account))
}