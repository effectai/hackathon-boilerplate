const { EffectClient, createAccount, createWallet } = require('@effectai/effect-js')
const readline = require('readline')
const fs = require('fs')

const main = async () => {
    console.log('Starting EOS example.')
    const client = new EffectClient('kylin')

    // Instantiating bsc account.
    const account = createAccount(
        // leave empty to generate new private key
        process.argv[2] ?? null
    )

    // Generate web3 instance from account with private key.
    // Could also be the web3 object with a MetaMask connection etc.
    const web3 = createWallet(account)

    // Connect web3 account to SDK
    const effectAccount = await client.connectAccount(web3);

    // console.log(`Starting eos.js\n${JSON.stringify(effectAccount, null, 2)}`)


    // if argv less than 3 exit
    if (process.argv.length <= 3) {
        console.log(
        `Usage: node eos.js <private key>
        If no privateKey provided burnerwallet will be created.
        Please make sure you have requested Testnet EFX for this account so that you can create batches. 
        Join our discord, go to the faucet channel to get funds.
        https://discord.gg/bq4teBnH3V
        Use the command following command to get tokens for your account.
        !get_tokens ${effectAccount.accountName} 
        `)

        const rl = readline.createInterface({input: process.stdin, output: process.stdout})
        rl.question('Press any key to continue after you have recieved funds from the bot....', (answer) => {
            console.log("Thanks! Now let's continue, making the campaign and batches.")
        })
        rl.close()
        // process.exit(1)
    }

    // wait for response from user in console to continue
    
    



    const templateContent = fs.readFileSync('./template.html', 'utf8').toString()

    const campaignToIpfs = {
        title: 'Random Title',
        description: 'Networked well-modulated instruction set',
        instructions: `American whole magazine truth stop whose. On traditional measure example sense peace.`,
        template:   templateContent,
        image: 'https://ipfs.effect.ai/ipfs/bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4',
        category: 'Image Labeling',
        example_task: {'image_url': 'https://ipfs.effect.ai/ipfs/bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga'},
        version: 1,
        reward: 1
    }

    // Create campaign.
    // campaign object, reward
    const makeCampaign = await client.force.makeCampaign(campaignToIpfs, '2')
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
    const batchResponse = await client.force.createBatch(campaign.id, batches.length, content, repetitions)
    console.log('createBatch', batchResponse)
    await client.force.waitTransaction(batchResponse.transaction_id)
    const batch = await client.force.getCampaignBatches(campaign.id)

    // Get task submissions of batch.
    const taskResults = await client.force.getTaskSubmissionsForBatch(batch.batch_id)
    console.log('taskResults for new batch', taskResults)
}

main()