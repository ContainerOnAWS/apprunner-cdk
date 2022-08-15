import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';

import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { SSM_PREFIX } from '../../config';

/**
 * This stack is written to share IAM role among multiple-cluster
 * 
 * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html
 * 
 * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html
 * 
 */
export class EcsIamRoleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const accessRole = new iam.Role(this, 'access-role', {
      roleName: `AppRunnerEcrAccessRole`,
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSAppRunnerServicePolicyForECRAccess',
        ),
      ]
    });

    const accessRoleParam = new ssm.StringParameter(this, 'ssm-access-role', { parameterName: `${SSM_PREFIX}/access-role-arn`, stringValue: accessRole.roleArn });

    new CfnOutput(this, 'SSMTaskExecRoleParam', { value: accessRoleParam.parameterName });
    new CfnOutput(this, 'SSMTaskExecRoleParamValue', { value: accessRoleParam.stringValue });
  }
}
