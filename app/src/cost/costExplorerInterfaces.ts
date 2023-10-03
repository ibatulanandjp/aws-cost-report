export interface DimenstionsFilters {
    Type: string;
    Key: string;
}

export interface Attributes {
    Attributes: {
        description: string;
    };
    Value: string;
}

export interface CeOutput {
    $metadata?: {
        httpStatusCode?: number | undefined;
        requestId?: string | undefined;
        attempts?: number;
        totalRetryDelay?: number;
    };
    DimensionValueAttributes: {
        Attributes: {
            description: string;
        };
        Value: string;
    }[];
    GroupDefinitions: {
        Key: string;
        Type: string;
    }[];
    ResultsByTime: {
        Estimate: boolean;
        Groups: {
            Keys: string[];
            Metrics: { UnblendedCost: { Amount: string; Unit: string } };
        }[];
        TimePeriod: { Start: string; End: string };
        Total?: any;
    }[];
}

export interface ProcessedDataOutput {
    accountId: string;
    description: string;
    services: {
        keys: string[];
        cost: {
            unitcostUSD: number;
            unitcostLOCAL: number;
        };
        TimePeriod: { Start: string; End: string };
    }[];
    totalCostUSD: number;
    totalCostLOCAL: number;
    estimateMonthlyTotalCostLOCAL: number;
}

export interface ProcessedDataOutputServices {
    keys: string[];
    cost: {
        unitcostUSD: number;
        unitcostLOCAL: number;
    };
}

export interface FetchCostDataInput {
    accountIds: string[];
    timeZoneOffset: {
        hours: number;
        minutes: number;
    };
}