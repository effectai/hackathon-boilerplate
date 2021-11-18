// Import from you local node_modules folder
// import "/node_modules/@effectai/effect-js/dist/index.umd.js"

// import from unpkg
// import 'https://unpkg.com/@effectai/effect-js@0.0.34/dist/index.umd.js'

console.log('Live from main.js! 🔥️🔥️🔥️');
let sdk;
let connectAccount = { providerName: undefined, provider: undefined, account: undefined };

/**
 * SDK Client
 * Create a new Effect SDK client.
 * Note how the entry name is `effectsdk`!.
 */
const generateClient = () => {
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
const getCampaign = async () => {
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
const createBurnerWallet = () => {
    console.log('creating burner wallet...')
    try {
        // When no parameters are passed to createAccount() a new keypair is generated.
        const burnerAccount = effectsdk.createAccount( /* Insert Private key here */);
        const burnerWallet = effectsdk.createWallet(burnerAccount);

        connectAccount.provider = burnerWallet
        connectAccount.account = null
        connectAccount.providerName = 'burnerwallet'

        document.getElementById('burner-wallet').innerHTML = `<p>${JSON.stringify(burnerAccount, null, 2)}</p>`
        document.getElementById('connect-to').innerText = `Connect with burner-wallet ${burnerAccount.address}`
    } catch (error) {
        alert('Something went wrong. See console for error message')
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
const connectMetamask = async () => {
    console.log('Connecting to metamask wallet.')
    if (window.ethereum) {
        try {
            const ethAccount = await ethereum.request({ method: 'eth_requestAccounts' });
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }] // 0x38 is the chainId of bsc testnet.    
            })

            connectAccount.provider = new Web3(window.ethereum)
            connectAccount.account = null
            connectAccount.providerName = 'metamask'

            document.getElementById('metamask-account').innerHTML =
                `Metmask Account: <p>${JSON.stringify(ethAccount, null, 2)}</p>
             ChainID: <p>${JSON.stringify(ethereum.chainId, null, 2)}</p>`

            document.getElementById('connect-to').innerText = `Connect with MetamaskAccount: ${ethAccount[0]}`

        } catch (error) {
            alert('Something went wrong. See console for error message')
            console.error(error)
        }
    } else {
        alert('Metamask not installed.')
    }
}

/**
 * EOS Anchor Wallet
 */
const connectAnchor = async () => {
    try {
        const transport = new AnchorLinkBrowserTransport()
        const alink = new AnchorLink({
            transport,
            chains: [
                {
                    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
                    nodeUrl: 'https://api.kylin.alohaeos.com',
                }
            ],
        })
        // Perform the login, which returns the users identity
        const identity = await alink.login('hackathon-boilerplate')

        const { session } = identity
        const signatureProvider = session.makeSignatureProvider()
        const account = { accountName: session.auth.actor.toString(), permission: session.auth.permission.toString() }
        console.log(`Logged in as`, account)
        connectAccount.provider = signatureProvider
        connectAccount.account = account
        connectAccount.providerName = 'anchor'
        document.getElementById('connect-to').innerText = `Connect with Anchor Account: ${session.auth}`

    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * Connect to Effect Account using burnerwallet, metamask or anchor
 */
const connectEffectAccount = async () => {
    console.log('Connecting to account with wallet.')
    let connectReponse;
    try {
        if (connectAccount.provider) {
            connectReponse = await sdk.connectAccount(connectAccount.provider, connectAccount.account)
        } else {
            alert('Login with on of the wallet.')
        }
        document.getElementById('connect-account').innerHTML = `<p>${JSON.stringify(connectReponse, null, 2)}</p>`
    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * Make Campaign
 * We need to upload the campaign to IPFS, then create the campaign on the blockchain.
 * This is done for us by the makeCampaign function.
 */
const makeCampaign = async () => {
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
            example_task: { 'image_url': 'https://ipfs.effect.ai/ipfs/bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga' },
            version: 1,
            reward: 1
        }

        const quantity = 1; // How much EFX is rewarded for each task.
        const makeCampaingResponse = await sdk.force.makeCampaign(campaignToIpfs, quantity)
        console.log(makeCampaingResponse)

        const divShowCampaign = document.getElementById('show-campaign');
        divShowCampaign.innerHTML = `<p>${JSON.stringify(makeCampaingResponse, null, 2)}</p>`
    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * TODO
 * Make Batch
 */
const makeBatch = async () => {
    try {
        const campaignId = 88
        const campaign = await sdk.force.getCampaign(campaignId)
        console.log('Campaign', campaign)

        // Get Campaign Batches.
        const batches = await sdk.force.getCampaignBatches(campaignId)
        console.log(`Batches for campaign ${campaignId}`, batches)

        const content = {
            'tasks': [
                { "ipfs": "bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4" },
                { "ipfs": "bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga" },
                { "ipfs": "bafkreid2ocabg7mo235uuwactlcf7vzxyagoxeroyrubfufwobtqz3q27q" },
                { "ipfs": "bafkreifu5xciyxpwnmkorzddanqtc66i43q5cn4sdkb3l563yjzd7s3274" }
            ]
        }

        const repetitions = 1
        // Create batch for campaign.
        // same here as for campaign, id of batch needs to be returned
        const batch = await sdk.force.createBatch(campaign.id, batches.length, content, repetitions)

        console.log(batch);

    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * TODO
 * Results
 */
const getResults = async () => {
    console.log('generating key...')
    try {
        // Get task submissions of batch.
        const taskResults = await sdk.force.getTaskSubmissionsForBatch()
        console.log('taskResults for new batch', taskResults)
    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

