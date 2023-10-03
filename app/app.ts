import { GetCostAndUsageCommandOutput } from "@aws-sdk/client-cost-explorer";
import { fetchCostData } from "./src/cost/fetchCostData";
import { processData } from "./src/cost/processData";
import { postNotification } from "./src/notification/postNotification";
import * as props from "./src/config/config.json";

export const main = async () => {
    let costDataOutput: GetCostAndUsageCommandOutput;

    // Fetch Cost Data from Cost Explorer
    costDataOutput = await fetchCostData(props);

    // Process the data
    const processedData = await processData(costDataOutput, props);

    // Send the cost notification
    await postNotification(processedData);
}

exports.handler = async function (event: any, context: any) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    return context.logStreamName;
};

if (require.main === module) {
    main();
}
