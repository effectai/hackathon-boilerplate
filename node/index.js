const effectjs = require('../../effect-js')

const main = async () => {
    console.log('Starting...')
    
    // Example sdkOptions, that are not needed right now. But are here for illuminating how to use the configuration object.
    const sdkOptions = {
        network: 'kylin',
        host: 'https://api.kylin.alohaeos.com'
    }
    const sdk = new effectjs.EffectClient('node', sdkOptions)

    // Instantiating burnerwallet.
    const burnerwallet = new effectjs.BurnerWallet().addAccount()
    // OR
    // const burnerWallet = new effectjs.BurnerWallet(
    //     '0x602df95949fc35d550100ab9e28142fceff2b42dd51f605ec92cd6f34a43af7a'
    // ).addAccount()

    const web3 = burnerWallet.getWeb3()
    const account = burnerWallet.getAccount()

    sdk.connectAccount('bsc', null, web3, null, account);
}

(async () => {
    await main()
})()

