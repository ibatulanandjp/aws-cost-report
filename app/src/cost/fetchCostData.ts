import {
    CostExplorerClient,
    GetCostAndUsageCommand,
    GetCostAndUsageCommandInput,
    GetCostAndUsageCommandOutput,
} from "@aws-sdk/client-cost-explorer";
import { FetchCostDataInput } from "./costExplorerInterfaces";

export const fetchCostData = async (props: FetchCostDataInput): Promise<GetCostAndUsageCommandOutput> => {
    const accountIds = props.accountIds;
    const ceClient = new CostExplorerClient();

    // Get Start and End Date [1 Day]
    const dayDifference = 1;
    const dateNow = new Date(Date.now());
    const startDate: string = dateConvertToString(new Date(dateNow.setDate(dateNow.getDate() - dayDifference)), props.timeZoneOffset);
    const endDate: string = dateConvertToString(Date.now(), props.timeZoneOffset);

    const ceParams: GetCostAndUsageCommandInput = generateCeParams(
        startDate,
        endDate,
        accountIds
    );
    const getCostAndUsageCommand = new GetCostAndUsageCommand(ceParams);
    try {
        return await ceClient.send(getCostAndUsageCommand);
    } catch (e) {
        throw e;
    }
};

const dateConvertToString = (date: Date | number, offset: { hours: number, minutes: number }): string => {
    // Convert current date time with UTC to other Timezone
    const dateObject = new Date(
        Number(date) + (new Date().getTimezoneOffset() + offset.hours * 60 + offset.minutes) * 60 * 1000
    );

    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');

    // Date string in the format "yyyy-mm-dd"
    return `${year}-${month}-${day}`;
};

const generateCeParams = (
    startDate: string,
    endDate: string,
    accountIds: string[]
): GetCostAndUsageCommandInput => {
    return {
        Granularity: "DAILY",
        Metrics: ["UnblendedCost"],
        GroupBy: [
            {
                Type: "DIMENSION",
                Key: "LINKED_ACCOUNT",
            },
            {
                Type: "DIMENSION",
                Key: "SERVICE",
            },
        ],
        Filter: {
            Dimensions: {
                Key: "LINKED_ACCOUNT",
                Values: accountIds,
            },
        },
        TimePeriod: {
            Start: startDate,
            End: endDate,
        },
    };
};
