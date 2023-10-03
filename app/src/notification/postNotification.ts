import axios from 'axios';
import { ProcessedDataOutput, ProcessedDataOutputServices } from "../cost/costExplorerInterfaces";
import * as props from "../config/config.json";

export const postNotification = async (costData: ProcessedDataOutput[]) => {
    for (const eachCostData of costData) {
        await postMessage(eachCostData);
    }
};

const postMessage = async (eachCostData: ProcessedDataOutput) => {
    console.log(eachCostData);

    const startDate = eachCostData.services[0].TimePeriod.Start;
    let messageBody: any = {}

    if (props.notificationPlatform.toLocaleLowerCase() == "teams") {
        messageBody = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            themeColor: "0076D7",
            title: `${startDate}: ${eachCostData.description} (${props.currency} ${Math.round(
                eachCostData.estimateMonthlyTotalCostLOCAL
            )}/month, ${props.currency} ${Math.round(eachCostData.totalCostLOCAL)}/day)`,
            text: `Account ID: ${eachCostData.accountId}`,
            sections: [
                {
                    facts: [
                        {
                            name: "Services",
                            value: "**Cost**",
                        },
                        {
                            name: "-----------------",
                            value: "**-----------**",
                        },
                    ],
                    markdown: true,
                },
            ],
        };
    }
    else if (props.notificationPlatform.toLocaleLowerCase() == "slack") {
        messageBody = {
            blocks: [
                {
                    type: "header",
                    text: {
                        "type": "plain_text",
                        text: `${startDate}: ${eachCostData.description} (${props.currency} ${Math.round(eachCostData.estimateMonthlyTotalCostLOCAL)}/month, ${props.currency} ${Math.round(eachCostData.totalCostLOCAL)}/day)\nAccount ID: ${eachCostData.accountId}`,
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: "*Services*"
                        },
                        {
                            type: "mrkdwn",
                            text: "*Cost*"
                        }
                    ]
                },
            ]
        };
    }

    eachCostData.services.forEach((eachService: ProcessedDataOutputServices) => {
        if (props.notificationPlatform.toLocaleLowerCase() == "teams") {
            messageBody.sections[0].facts.push({
                name: `${eachService.keys[1]}`,
                value: `${Math.round(eachService.cost.unitcostLOCAL * 10) / 10}`,
            });
        }
        else if (props.notificationPlatform.toLocaleLowerCase() == "slack") {
            messageBody.blocks.push({
                type: "section",
                fields: [
                    {
                        type: "plain_text",
                        text: `${eachService.keys[1]}`
                    },
                    {
                        type: "plain_text",
                        text: `${Math.round(eachService.cost.unitcostLOCAL * 10) / 10}`
                    }
                ]
            });
            // messageBody.blocks[0].fields.push({
            //     type: "plain_text",
            //     // text: `${eachService.keys[1]} \t ${Math.round(eachService.cost.unitcostLOCAL * 10) / 10}`
            //     text: `${eachService.keys[1]}`
            // });

            // // console.log(`Service Cost: ${Math.round(eachService.cost.unitcostLOCAL * 10) / 10}`);
            // messageBody.blocks[0].fields.push({
            //     type: "plain_text",
            //     text: `${Math.round(eachService.cost.unitcostLOCAL * 10) / 10}`
            // });
        }
    });

    console.log("Sending cost notification to the webhook");

    try {
        const results = await axios.post(props.webhookUrl, messageBody, {
            headers: {
                Accept: "application/json"
            },
        });
        console.log("Status: " + results.status);
        console.log("******************");
    } catch (e: any) {
        console.log("Error sending cost notification to the webhook: " + e);
    }
};
