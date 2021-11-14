import "/node_modules/@effectai/effect-js/dist/index.umd.js"
// import { exports } from 'https://unpkg.com/@effectai/effect-js@0.0.31/dist/index.umd.js'

console.log('Live from main.js!🎆🎆🎆');
const rpc = 'https://bsc-dataseed1.ninicoin.io/'

document.getElementById('btn-print').onclick = () => {
    console.log('Creating SDK...')

    const sdkConfig = { 
        network: 'kylin', 
        host: 'https://api.kylin.alohaeos.com:443', 
    };

    const sdk = new effectsdk.EffectClient('browser', sdkConfig)
    console.log(sdk)   
}

document.getElementById('btn-other').onclick = () => {

}

document.getElementById('btn-key').onclick = () => {
    console.log('generating key...')

    try {
        const rpc = 'https://bsc-dataseed1.ninicoin.io/'
        const w3 = new Web3(new Web3.providers.HttpProvider(rpc))
        console.log(w3)
        const account = w3.eth.accounts.create()  
        console.log(JSON.stringify(account))
    } catch (error) {
        console.error(error)
    }
}
