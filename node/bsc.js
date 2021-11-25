const { EffectClient, createAccount, createWallet } = require('@effectai/effect-js')
const fs = require('fs')

const main = async () => {
    console.log('Starting BSC example.')
    const client = new EffectClient('kylin')

    // Instantiating bsc account.
    const account = createAccount(
        // leave empty to generate new private key
        '0x6f46d8d7c9684ed049c941758cb9186eb2b5758221a229e27861fe357edb770d'
    )
    // Generate web3 instance from account with private key.
    // Could also be the web3 object with a MetaMask connection etc.
    const web3 = createWallet(account)

    // Connect web3 account to SDK
    const effectAccount = await client.connectAccount(web3);

    console.log('effectAccount', effectAccount)

    const templateContent = fs.readFileSync('./template.html', 'utf8').toString()

    const campaignToIpfs = {
        title: 'Random Title',
        description: 'Networked well-modulated instruction set',
        instructions: `American whole magazine truth stop whose. On traditional measure example sense peace. Would mouth relate own chair.
        Together range line beyond. First policy daughter need kind miss`,
        template: templateContent,
        image: 'https://ipfs.effect.ai/ipfs/bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4',
        category: 'Image Labeling',
        example_task: {'image_url': 'https://ipfs.effect.ai/ipfs/bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga'},
        version: 1,
        reward: 1
    }

    // Create campaign.
    // campaign object, reward
    const makeCampaign = await client.force.makeCampaign(campaignToIpfs, '8')
    console.log('makeCampaign', makeCampaign)
    await client.force.waitTransaction(makeCampaign.transaction_id)

    // Retrieve last campaign
    const campaign = client.force.getMyLastCampaign()
    console.log('Campaign', campaign)

    const content = {
        'tasks': [
            {"ipfs": "bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4"}, 
            {"ipfs": "bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga"}, 
            {"ipfs": "bafkreid2ocabg7mo235uuwactlcf7vzxyagoxeroyrubfufwobtqz3q27q"}, 
            {"ipfs": "bafkreifu5xciyxpwnmkorzddanqtc66i43q5cn4sdkb3l563yjzd7s3274"}
        ]
    }

    // Make sure you have enough funds to pay for the batch.
    // Join our discord and use the faucet bot to get funds.
    // https://discord.gg/bq4teBnH3V

   
    const repetitions = 1
    // Create batch for campaign.
    // same here as for campaign, id of batch needs to be returned
    const batchResponse = await client.force.createBatch(campaign.id, content, repetitions)
    console.log('createBatch', batchResponse)
    await client.force.waitTransaction(batchResponse.transaction_id)
    const batch = await client.force.getCampaignBatches(campaign.id)



    // Get task submissions of batch.
    const taskResults = await client.force.getTaskSubmissionsForBatch(batch.batch_id)
    console.log('taskResults for new batch', taskResults)
}

main()