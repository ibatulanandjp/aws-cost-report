import * as cdk from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class AwsCostReportStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Role for Lambda Execution
    const lambdaExecutionRole: Role = new Role(this,
      "CostReportLambdaRole",
      {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
        ]
      });

    // Lambda function
    const lambdaFunction = new Function(this,
      "CostReportLambda",
      {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromAsset("./app"),
        handler: "app.main",
        role: lambdaExecutionRole,
        memorySize: 256,
        timeout: cdk.Duration.seconds(120),
      });

    // Add policy to the Lambda funcction to access and get cost and usage from Cost Explorer
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: ['ce:GetCostAndUsage'],
    }));

    // EventBridge rule to trigger the Lambda function every day at 08:00 AM JST
    const eventRule = new Rule(this,
      "DailyCostReportRule",
      {
        schedule: Schedule.cron({
          minute: '0',
          hour: '23',
          day: '*',
        }),
      });

    // Add Lambda function as a target for the EventBridge rule
    eventRule.addTarget(new LambdaFunction(lambdaFunction));
  }
}
