// import from node_modules
// import Web3 from "web3";
import "/node_modules/@effectai/effect-js/dist/index.umd.js"

// import from unpkg
// import { exports } from 'https://unpkg.com/@effectai/effect-js@0.0.31/dist/index.umd.js'


// Figure out how to get jssig working, eosjs transit looks like to be the best solution at the moment to get it to work with an eosjs wallet.

// npn install eosjs
// import { JsSignatureProvider } from './node_modules/eosjs/dist/eosjs-jssig.js'
// import { JsSignatureProvider } from '/node_modules/eosjs/dist/eosjs-jssig'
// import * as eosjs from '/node_modules/eosjs/dist/eosjs-jssig.js'
// import * as eosjs from 'https://unpkg.com/eosjs@22.1.0/dist/eosjs-jssig'

// git clone eosjs
// import { JsSignatureProvider } from "./eosjs/dist-web/eosjs-jssig.js";

console.log('Live from main.js! 🔥️🔥️🔥️');
let sdk
let connectAccount = { accountService: undefined, address: undefined, detail: undefined };

/**
 * SDK Client
 * Create a new Effect SDK client.
 * Note how the entry name is `effectsdk`!.
 */
document.getElementById('btn-generate-client').onclick = () => {
    console.log('Creating SDK...')
    try {
        sdk = new effectsdk.EffectClient('kylin')
        console.log(sdk)   
        const divSdkClient = document.getElementById('sdk-client');
        divSdkClient.innerHTML = 
        `SDK Client: Connected ✅ (See console for more info.): 
         <p>Host: ${sdk.config.host}</p>
         <p>IPFS ${sdk.config.ipfs_node}</p>
         <p>Network: ${sdk.config.network}</p>`;

         // If successfull remove disabled attribute for buttons.
         document.getElementById('btn-connect-account').removeAttribute('disabled')
         document.getElementById('btn-get-campaign').removeAttribute('disabled')
         document.getElementById('btn-make-campaign').removeAttribute('disabled')
    } catch (error) {
        console.error(error)
        const divSdkClient = document.getElementById('sdk-client');
        divSdkClient.innerHTML = `<p>${JSON.stringify(error)}</p>`
    }        
}

document.getElementById('btn-get-campaign').onclick = async () => {
    const balanceReponse = await sdk.force.getPendingBalance();
    const campaignResponse = await sdk.force.getCampaign(5)
    console.log(JSON.stringify(campaignResponse), JSON.stringify(balanceReponse))

    document.getElementById('show-get-campaign').innerHTML = 
    `<p>ID: ${campaignResponse.id}</p>
     <p>Owner: ${campaignResponse.owner}</p>
     <p>Hash: ${campaignResponse.content.field_1}</p>
     <p>Reward : ${JSON.stringify(campaignResponse.reward)}</p>
     <p>Title: ${campaignResponse.info.title}</p>
     <p>Description: ${campaignResponse.info.description}</p>
     <p>PendingBalance:\n${JSON.stringify(balanceReponse)}</p>
    `
}

/**
 * Create Effect Account
 * Generates a new account when no parameter is passed.
 * Otherwise pass a web3 private key to create an account.
 */
document.getElementById('btn-create-burner-wallet').onclick = () => {
    console.log('creating burner wallet...')
    try {
        const burnerWallet = effectsdk.createAccount();
        
        connectAccount.detail = burnerWallet
        connectAccount.address = burnerWallet.address
        connectAccount.accountService = 'burnerwallet'

        document.getElementById('burner-wallet').innerHTML = `<p>${JSON.stringify(burnerWallet, null, 2)}</p>`
        document.getElementById('connect-to').innerText = `Connect with burner-wallet`
    } catch (error) {
        console.error(error)
    }
}

/**
 * Create wallet
 * Generate web3 instance from account with private key.
 * Could also be the web3 object with a metamask connection. 
 * This examle uses Metamask.
 * 
 * Here we will also make a call to make sure we are on the correct chain.
 * Exhaustive list of available chains can be found here:
 * https://chainlist.org/
 */
document.getElementById('btn-metamask').onclick =  async () => {
    console.log('Connecting to Wallet.')
    try {
        const ethAccount = await ethereum.request({ method: 'eth_requestAccounts' });
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }] // 0x38 is the chainId of bsc testnet.    
        }) 

        connectAccount.detail = ethAccount
        connectAccount.address = ethAccount[0]
        connectAccount.accountService = 'metamask'

        document.getElementById('metamask-account').innerHTML = 
        `Metmask Account: <p>${JSON.stringify(ethAccount, null, 2)}</p>
         ChainID: <p>${JSON.stringify(ethereum.chainId, null, 2)}</p>`

        document.getElementById('connect-to').innerText = `Connect with MetamaskAccount: ${ethAccount[0]}`

    } catch (error) {
        console.error(error)
    }
}

/**
 * Connect Account
 */
document.getElementById('btn-connect-account').onclick = async () => {
    console.log('Connecting to account with wallet.')
    let connectReponse;
    try {
        if (connectAccount.accountService === 'burnerwallet') {
            const signatureProvider = new JsSignatureProvider([connectAccount.detail.privateKey]) // privkey needs to be passed as in an array of strings
            connectReponse = await sdk.connectAccount(signatureProvider)
        } else if (connectAccount.accountService === 'metamask') {
            const w3 = new Web3(window.ethereum)
            console.log(w3)
            connectReponse = await sdk.connectAccount(w3)
        } else {
            connectReponse = await sdk.connectAccount()
        }
        
        document.getElementById('connect-account').innerHTML = `<p>${JSON.stringify(connectReponse, null, 2)}</p>`
    } catch (error) {
        console.error(error)
    }
}

/**
 * Make Campaign
 * We need to upload the campaign to IPFS, then create the campaign on the blockchain.
 * This is done for us by the makeCampaign function.
 */
document.getElementById('btn-make-campaign').onclick = async () => {
    console.log('creating campaign...')
    
    // Template String is available in this repo, otherwise it can be anywhere else.
    const templateResponse = await fetch('./template.html')
    const templateText = await templateResponse.text()

    const campaignToIpfs = {
        title: 'SpaceX Satelite Identifier.',
        description: 'Networked well-modulated instruction set',
        instructions: `American whole magazine truth stop whose. On traditional measure example sense peace`,
        template: templateText,
        image: 'https://ipfs.effect.ai/ipfs/bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4',
        category: 'Image Labeling',
        example_task: {'image_url': 'https://ipfs.effect.ai/ipfs/bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga'},
        version: 1,
        reward: 1
    }

    const quantity = 1; // How much EFX is rewarded for each task.
    const makeCampaingResponse = await sdk.force.makeCampaign(campaignToIpfs, quantity)
    console.log(makeCampaingResponse)

    const divShowCampaign = document.getElementById('show-campaign');


    // // Upload campaign to IPFS
    // divUploadCampaign.innerHTML = `<p>Uploading Campaign to IPFS...</p>`
    // const uploadResponse = await sdk.force.uploadCampaing(campaignToIpfs)
    // console.log(uploadResponse)
    // divUploadCampaign.innerHTML = `<p>Uploaded Campaign to IPFS!</p>`
    // divUploadCampaign.innerHTML += `<p>${JSON.stringify(uploadResponse, null, 2)}</p>`

    // // Create campaign on the blockchain
    // const divCreateCampaign = document.getElementById('create-campaign');
    // divCreateCampaign.innerHTML = `<p>Creating Campaign on Blockchain...</p>`
    // const createResponse = await sdk.force.createCampaign(uploadResponse.hash)
    // console.log(createResponse)
    // divCreateCampaign.innerHTML = `<p>Created Campaign on Blockchain!</p>`
    // divCreateCampaign.innerHTML += `<p>${JSON.stringify(createResponse, null, 2)}</p>`

    try {
        
    } catch (error) {
        console.error(error)
    }
}

// document.getElementById('btn-key').onclick = () => {
//     console.log('generating key...')

//     try {

//     } catch (error) {
//         console.error(error)
//     }
// }

