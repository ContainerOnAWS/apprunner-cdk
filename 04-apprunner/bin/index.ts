#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppRunnerStack } from '../lib/apprunner-stack';
import { DEFAULT_STAGE } from '../../config';

const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
const stage = app.node.tryGetContext('stage') || DEFAULT_STAGE;

new AppRunnerStack(app, `apprunner-${stage}`,  {
    env,
    stage,
    description: 'AppRunner with SpringBoot application',
    terminationProtection: stage!==DEFAULT_STAGE
});