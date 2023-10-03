import { Attributes, CeOutput, ProcessedDataOutput } from "./costExplorerInterfaces";
import axios from 'axios';

export const processData = async (costDataOutput: any, props: { currency: string }): Promise<ProcessedDataOutput[]> => {

    const apiUrl = "https://open.er-api.com/v6/latest/USD"

    let dollarExchangeRate = 0;
    // Fetch Latest conversion rates from Exchange-Rate API
    try {
        const response: any = await axios.get(apiUrl);
        dollarExchangeRate = response.data["rates"][props.currency];
    } catch (error) {
        console.log("Error fetching latest exchange rates: ", error);
    }

    const costData: CeOutput = costDataOutput;
    let usage: ProcessedDataOutput[] = [];
    costData.DimensionValueAttributes.forEach(
        (attributes: Attributes, index: number) => {
            usage.push({
                accountId: attributes.Value,
                description: attributes.Attributes.description,
                services: [],
                totalCostUSD: 0,
                totalCostLOCAL: 0,
                estimateMonthlyTotalCostLOCAL: 0,
            });

            const servicesFilteredById = costData.ResultsByTime[0].Groups.filter(
                (accountId: any) => {
                    return accountId.Keys[0] == attributes.Value;
                }
            );

            let totalCostUSD: number = 0;
            const servicesFormatted = servicesFilteredById.map((groups: any) => {
                totalCostUSD =
                    totalCostUSD + Number(groups.Metrics.UnblendedCost.Amount);

                return {
                    keys: groups.Keys,
                    cost: {
                        unitcostUSD: groups.Metrics.UnblendedCost.Amount,
                        unitcostLOCAL: groups.Metrics.UnblendedCost.Amount * dollarExchangeRate,
                    },
                    TimePeriod: {
                        Start: costData.ResultsByTime[0].TimePeriod.Start,
                        End: costData.ResultsByTime[0].TimePeriod.End,
                    },
                };
            });

            servicesFormatted.sort((x: any, y: any) => {
                if (x.cost.unitcostUSD < y.cost.unitcostUSD) {
                    return 1;
                } else {
                    return -1;
                }
            });

            usage[index].services = servicesFormatted;
            usage[index].totalCostUSD = totalCostUSD;
            usage[index].totalCostLOCAL = totalCostUSD * dollarExchangeRate;
            usage[index].estimateMonthlyTotalCostLOCAL = totalCostUSD * dollarExchangeRate * 30;
        }
    );
    return usage;
};
