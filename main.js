console.log("Live from Amsterdam, it's Effect Network! 🔥️🔥️🔥️");
let client, campaignid, batchidentification;
let connectAccount = { providerName: undefined, provider: undefined, account: undefined };

/**
 * SDK Client
 * Create a new Effect SDK client.
 * Note how the entry name is `effectsdk`!.
 */
function generateClient() {
    console.log('Creating SDK...')
    try {
        client = new effectsdk.EffectClient('jungle') //kylin
        console.log(client)
        const divSdkClient = document.getElementById('sdk-client');
        divSdkClient.innerHTML =
            `SDK Client: Connected (See console for more info.): 
         <p>Host: ${client.config.host}</p>
         <p>IPFS ${client.config.ipfs_node}</p>
         <p>Network: ${client.config.network}</p>`;

        // If successfull remove disabled attribute for buttons.
        document.getElementById('btn-connect-account').removeAttribute('disabled')
        document.getElementById('btn-get-campaign').removeAttribute('disabled')
    } catch (error) {
        console.error(error)
        const divSdkClient = document.getElementById('sdk-client');
        divSdkClient.innerHTML = `<p>${JSON.stringify(error)}</p>`
    }
}

/**
 * Calling methods from the effectclient without connecting an account.
 */
async function getCampaign() {
    const balanceReponse = await client.force.getPendingBalance();

    const randomNumber = Math.floor(Math.random() * 10) + 1;
    const campaignResponse = await client.force.getCampaign(randomNumber)
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
function createBurnerWallet() {
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
async function connectMetamask() {
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
async function connectAnchor() {
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
async function connectEffectAccount() {
    console.log('Connecting to account with wallet.')
    let connectReponse;
    try {
        if (connectAccount.provider) {
            connectReponse = await client.connectAccount(connectAccount.provider, connectAccount.account)
        } else {
            alert('Login with on of the wallet.')
        }
        document.getElementById('btn-make-campaign').removeAttribute('disabled')
        document.getElementById('btn-last-campaign').removeAttribute('disabled')
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
async function makeCampaign() {
    console.log('creating campaign...')

    try {
        // Template String is available in this repo, otherwise it can be anywhere else.
        const templateResponse = await fetch('./template.html')
        const templateText = await templateResponse.text()

        const campaignToIpfs = {
            title: 'Tweet Sentiment',
            description: 'Networked well-modulated instruction set',
            instructions: `American whole magazine truth stop whose. On traditional measure example sense peace`,
            template: templateText,
            image: 'https://ipfs.effect.ai/ipfs/bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4',
            category: 'Effect Socials',
            example_task: { 'tweet_id': '20' },
            version: 1,
            reward: 1
        }

        const quantity = 1; // How much EFX is rewarded for each task.
        const makeCampaingResponse = await client.force.makeCampaign(campaignToIpfs, quantity)
        console.log(makeCampaingResponse)
        await client.force.waitTransaction(makeCampaign.transaction_id)

        document.getElementById('btn-make-batch').removeAttribute('disabled')

        const retrieveCampaign = await client.force.getMyLastCampaign()
        const divShowCampaign = document.getElementById('show-campaign');
        divShowCampaign.innerHTML = `<p>${JSON.stringify(retrieveCampaign, null, 2)}</p>`
    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * Retrieve the last campaign you made with this account.
 */
async function getLastCampaign() {
    console.log('getting last campaign...')
    try {
        const retrieveCampaign = await client.force.getMyLastCampaign()
        const divShowCampaign = document.getElementById('show-campaign');
        divShowCampaign.innerHTML = `<p>${JSON.stringify(retrieveCampaign, null, 2)}</p>`
        document.getElementById('btn-make-batch').removeAttribute('disabled')
    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * Make Batch
 * Is the method complete in the smart contract in order to retrieve the campaign id???
 * Make sure you have enough funds to pay for the batch.
 * Join our discord and use the faucet bot to get funds.
 * https://discord.gg/bq4teBnH3V
 */
async function makeBatch() {
    try {
        const campaign = await client.force.getMyLastCampaign()
        console.log(`Campaign 🚒:\n${JSON.stringify(campaign)}`)

        const content = {
            'tasks': [
                { "tweet_id": "20" },
                { "tweet_id": "22" },
                { "tweet_id": "23" },
                { "tweet_id": "24" }
            ]
        }

        const repetitions = '1'

        const batchResponse = await client.force.createBatch(campaign.id, content, repetitions)
        // document.getElementById('show-batch').innerHTML = `<p>${JSON.stringify(batchResponse, null, 2)}</p>`
        console.log(batchResponse);
        await client.force.waitTransaction(batchResponse.transaction_id)
        const newBatch = await client.force.getCampaignBatches(campaign.id)
        batchidentification = newBatch.pop().batch_id
        document.getElementById('show-batch').innerHTML = `<p>${JSON.stringify(newBatch, null, 2)}</p>`
        document.getElementById('btn-get-result').removeAttribute('disabled')    

    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

/**
 * TODO
 * Results
 */
async function getResults() {
    console.log('generating key...')
    try {
        // Get task submissions of batch.
        const lastcampaign = await client.force.getMyLastCampaign()
        const lastBatch = await client.force.getCampaignBatches(lastcampaign.id)
        const taskResults = await client.force.getTaskSubmissionsForBatch(lastBatch.pop().batch_id)
        console.log(`TaskResults for batch with id: ${batchidentification}`, taskResults)

        document.getElementById('show-result').innerHTML = `<p>${JSON.stringify(taskResults, null, 2)}</p>`
    } catch (error) {
        alert('Something went wrong. See console for error message')
        console.error(error)
    }
}

