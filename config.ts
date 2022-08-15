import * as cdk from 'aws-cdk-lib';

/**
 * 
 */
export const SSM_PREFIX = '/apprunner-cdk';


export const DEFAULT_STAGE = 'dev';

export interface StackCommonProps extends cdk.StackProps {
    stage: string;
}