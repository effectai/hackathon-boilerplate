// Import from you local node_modules folder
// import "/node_modules/@effectai/effect-js/dist/index.umd.js"

// import from unpkg
// import 'https://unpkg.com/@effectai/effect-js@0.0.34/dist/index.umd.js'

/**
 * Experiments to get JsSignature provider to work:
 * Figure out how to get jssig working, eosjs transit looks like to be the best solution at the moment to get it to work with an eosjs wallet.
 */

// npn install eosjs
// import { JsSignatureProvider } from './node_modules/eosjs/dist/eosjs-jssig.js'
// import { JsSignatureProvider } from '/node_modules/eosjs/dist/eosjs-jssig'
// import * as eosjs from '/node_modules/eosjs/dist/eosjs-jssig.js'
// import * as eosjs from 'https://unpkg.com/eosjs@22.1.0/dist/eosjs-jssig'

// git clone eosjs
// import { JsSignatureProvider } from "./eosjs/dist-web/eosjs-jssig.js";

console.log('Live from main.js! 🔥️🔥️🔥️');
let sdk, burnerAccount, metaMaskAccount;
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

/**
 * Calling methods from the effectclient without connecting an account.
 */
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
 * BurnerWallet
 * Generates a new account when no parameter is passed.
 * Otherwise pass a web3 private key to create an account.
 */
document.getElementById('btn-create-burner-wallet').onclick = () => {
    console.log('creating burner wallet...')
    try {
        // When no parameters are passed to createAccount() a new keypair is generated.
        const burnerWallet = effectsdk.createAccount( /* Insert Private key here */);

        burnerAccount = effectsdk.createWallet(burnerWallet);
        
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
 * Metamask
 * Generate web3 instance from account with private key.
 * Could also be the web3 object with a metamask connection. 
 * 
 * Here we will also make a call to make sure we are on the correct chain.
 * Bsc-Mainnet: 0x38 (hex), 56 (decimal)
 * Bsc-Testnet: 0x61 (hex), 97 (decimal)
 * 
 */
document.getElementById('btn-metamask').onclick =  async () => {
    console.log('Connecting to metamask wallet.')
    if(window.ethereum) {
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
    } else {
        alert('Metamask not installed.')
    }
}

/**
 * TODO
 * Anchor Wallet
 */
document.getElementById('btn-anchor').onclick = () => {
    console.log('generating key...')

    try {
        // Do stuff
    } catch (error) {
        console.error(error)
    }
}

/**
 * Connect to Effect Account using burnerwallet, metamask
 */
document.getElementById('btn-connect-account').onclick = async () => {
    console.log('Connecting to account with wallet.')
    let connectReponse;
    try {
        if (connectAccount.accountService === 'burnerwallet') {
            connectReponse = await sdk.connectAccount(burnerAccount)
        } else if (connectAccount.accountService === 'metamask') {
            const metaWeb3 = new Web3(window.ethereum)
            connectReponse = await sdk.connectAccount(metaWeb3)
        } else {
            // connectReponse = await sdk.connectAccount()
            alert('Login with on of the wallet.')
        }
        document.getElementById('connect-account').innerHTML = `<p>${JSON.stringify(connectReponse, null, 2)}</p>`
    } catch (error) {
        console.error(error)
    }
}

/**
 * TODO DEBUG
 * Make Campaign
 * We need to upload the campaign to IPFS, then create the campaign on the blockchain.
 * This is done for us by the makeCampaign function.
 */
document.getElementById('btn-make-campaign').onclick = async () => {
    console.log('creating campaign...')
    
    try {
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
        divShowCampaign.innerHTML = `<p>${JSON.stringify(makeCampaingResponse, null, 2)}</p>`        
    } catch (error) {
        console.error(error)
    }
}

/**
 * TODO
 * Make Batch
 */
document.getElementById('btn-make-batch').onclick = async () => {
    console.log('generating key...')
    try {
        const campaignId = 88
        const campaign = await sdk.force.getCampaign(campaignId)
        console.log('Campaign', campaign)
    
        // Get Campaign Batches.
        const batches = await sdk.force.getCampaignBatches(campaignId)
        console.log(`Batches for campaign ${campaignId}`, batches)
    
        const content = {
            'tasks': [
                {"ipfs": "bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4"}, 
                {"ipfs": "bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga"}, 
                {"ipfs": "bafkreid2ocabg7mo235uuwactlcf7vzxyagoxeroyrubfufwobtqz3q27q"}, 
                {"ipfs": "bafkreifu5xciyxpwnmkorzddanqtc66i43q5cn4sdkb3l563yjzd7s3274"}
            ]
        }
       
        const repetitions = 1
        // Create batch for campaign.
        // same here as for campaign, id of batch needs to be returned
        const batch = await sdk.force.createBatch(campaign.id, batches.length, content, repetitions)

        console.log(batch);

    } catch (error) {
        console.error(error)
    }
}

/**
 * TODO
 * Results
 */
document.getElementById('btn-get-result').onclick = async () => {
    console.log('generating key...')
    try {
        
        // Get task submissions of batch.
        const taskResults = await sdk.force.getTaskSubmissionsForBatch()
        console.log('taskResults for new batch', taskResults)
    } catch (error) {
        console.error(error)
    }
}

