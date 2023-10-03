#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCostReportStack } from '../lib/aws-cost-report-stack';

// Instantiate the cdk app
const app = new cdk.App();

new AwsCostReportStack(app, 'AwsCostReportStack');