import * as cdk from 'aws-cdk-lib';

/**
 * 
 */
export const SSM_PREFIX = '/cdk-apprunner';


export const DEFAULT_STAGE = 'dev';

export interface StackCommonProps extends cdk.StackProps {
    stage: string;
}