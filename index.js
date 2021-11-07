const effectjs = require('@effectai/effect-js')
const eosjs = require('eosjs')
const Web3 = require('web3')
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
const process = require('process')


if (process.argv.length < 3) {
    console.log('Usage: node index.js <privateKey>')
    process.exit(1)
} 

const main = async () => {
    console.log('Starting...')
    
    const defaultPrivateKey = process.argv[2]; // pixeos1gswap@active
    const account_name = 'pixeos1gswap'
    const account_permission = 'active'
    const account_id = 11

    const rpc = 'https://bsc-dataseed1.ninicoin.io/'
    const w3 = new Web3(rpc)
    w3.eth.accounts.wallet.create(1)
    // w3.eth.accounts.wallet.add(defaultPrivateKey)
    
    const jsSignatureProvider = new JsSignatureProvider([defaultPrivateKey]);

    const effectConfig = { 
        network: 'kylin', 
        host: 'https://api.kylin.alohaeos.com:443', 
        JsSignatureProvider: jsSignatureProvider,
        web3: w3
    };
    
    const efx = new effectjs.EffectClient('testnet', effectConfig);
    // console.log(efx)
    
    // Call basic functionality here, such as: 

    const efxAccount = await efx.connectAccount('bsc', jsSignatureProvider, w3);
    console.log(efxAccount)

    

    // const openacc = await efx.account.openAccount(account_name, account_permission)
    // console.log(openacc)
    // const vaccount = await efx.account.getVAccountByName(account_name)
    // console.log(vaccount)

    // uploadCampaign, then we can look at creating the campaign, upload something like this to ipfs then we can look at creating the campaign.
    // I think these need to be passed as options to the campaign method parameter
    // reset campaign

    // Note the use of backticks for multiline lines!
    // Important question, can we use backticks to define our templates? Or does it mess with how the place_holder is parsed?
    // More importantly note the use of the place_holder name
    // We will be passing the whole url to the image tag defined in this template
    // 
    const campaignToIpfs = {
        title: 'Random Title',
        description: 'Networked well-modulated instruction set',
        instructions: `American whole magazine truth stop whose. On traditional measure example sense peace. Would mouth relate own chair.
        Together range line beyond. First policy daughter need kind miss.`,
        template:   `<div id="task">
                        <image src='` + '${image_url}' + `'></image>
                        <h2>Image Classification</h2>
                        <option submit name="button-answer" type="button" :options="['Cat','Dog','Mechanical Turk','Other']" label="What do you see in the picture above?"></option>
                    </div>`,
        image: 'https://ipfs.effect.ai/ipfs/bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4',
        category: 'Image Labeling',
        example_task: {'image_url': 'https://ipfs.effect.ai/ipfs/bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga'},
        version: 1,
        reward: 1
        }

    const upload_campaign_tx = await efx.force.uploadCampaign(JSON.stringify(campaignToIpfs))
    console.log(upload_campaign_tx)

    console.log('creating campaign');
    const campaign_tx = await efx.force.createCampaign(account_name, account_id, 1, upload_campaign_tx.hash, '12', {})
    console.log(campaign_tx)

    //  getCampaigns = async (nextKey, limit = 20): Promise<GetTableRowsResult> => {
    console.log('Getting campaign');
    const campaign = await efx.force.getCampaigns('', 500)
    console.log(`Campaign:: ${JSON.stringify(campaign, null, 4)}`)
    
    // get last batch
    console.log(JSON.stringify(campaign.rows[campaign.rows.length - 1]))

    /**
     * Taks creation, the content is a list of tasks, a task is just an object containing information about how to get the data.
     * 
     * This is how a list of tasks looks like:
     * [{"ipfs":""},{"ipfs":""},{"ipfs":""}]
     * 
     * In this case ipfs is the place_holder value. Remeber that? If we take a look back at the template we defined above you will notice the name of the place_holder is the same as here.
     * 
     * Take note of how the place holder is created, here the place holder is `ipfs`, and the value that we pass is an IPFS hash. 
     * This means that the way the template is made should contain a complete link to a ipfs server, and a place holder for the ipfs hash when it is received.?
     * Capiche?
     * 
     * Create the content
     * const content = {
     *     tasks: [{"ipfs": }, {}, {}]
     * }
     * 
     */

    // Create content with tasks
    const taskBatch = {
        'tasks': [
            {"ipfs": "bafkreiggnttdaxleeii6cdt23i4e24pfcvzyrndf5kzfbqgf3fxjryj5s4"}, 
            {"ipfs": "bafkreidrxwhqsxa22uyjamz7qq3lh7pv2eg3ykodju6n7cgprmjpal2oga"}, 
            {"ipfs": "bafkreid2ocabg7mo235uuwactlcf7vzxyagoxeroyrubfufwobtqz3q27q"}, 
            {"ipfs": "bafkreifu5xciyxpwnmkorzddanqtc66i43q5cn4sdkb3l563yjzd7s3274"}
        ]
    }

    console.log(`taskBatch: \n\n${JSON.stringify(taskBatch, null, 4)}`)
    const repetitions = 3
    const batch = await efx.force.createBatch(account_name, campaign.id, campaign.rows.length, taskBatch, repetitions, {})
    console.log(batch)
}

(async () => {
    await main()
})()

