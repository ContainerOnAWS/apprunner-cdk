import { Stack, CfnOutput, Lazy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { StackCommonProps, SSM_PREFIX } from '../../config';

/**
 * Deploy with ECR image that created using ecr-codecommit stack
 */
export class AppRunnerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackCommonProps) {
    super(scope, id, props);

    // const service = apprunner.CfnService

    const serviceName = `apprunnder-${props.stage}`;
    const ecrUrl = `${props.env?.account}.dkr.ecr.${props.env?.region}.amazonaws.com/fargate-restapi-${props.stage}:latest`;

    // const accessRole = new iam.Role(this, 'access-role', {
    //   roleName: `AppRunnerEcrAccessRole${this.stackId}`,
    //   // roleName: `AppRunnerEcrAccessRole-$serviceName`,
    //   assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
    //   managedPolicies: [
    //     iam.ManagedPolicy.fromAwsManagedPolicyName(
    //       'service-role/AWSAppRunnerServicePolicyForECRAccess',
    //     ),
    //   ]
    // });

    const accessRoleArn = ssm.StringParameter.valueFromLookup(this, `${SSM_PREFIX}/access-role-arn`);
    const vpcId = ssm.StringParameter.valueFromLookup(this, `${SSM_PREFIX}/vpc-id`);

    const cfnService = new apprunner.CfnService(this, 'cfn-service', {
      serviceName,
      tags: [{
        key: 'stage',
        value: props.stage,
      }],
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: Lazy.string({ produce: () => accessRoleArn }),
        },
        autoDeploymentsEnabled: false,
        imageRepository: {
          imageRepositoryType: 'ECR',
          imageIdentifier: ecrUrl,
          imageConfiguration: {
            port: '8080',
            runtimeEnvironmentVariables: [{
              name: 'stage',
              value: props.stage,
            }],
          },
        },
      },
      healthCheckConfiguration: {
        healthyThreshold: 2,
        unhealthyThreshold: 5,
        timeout: 19,
        interval: 20,
        path: '/',
        protocol: 'HTTP'
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcId,
        },
      },
    });

    new CfnOutput(this, 'ServiceName', { value: cfnService.serviceName as string });
    new CfnOutput(this, 'ServiceURL', { value: cfnService.attrServiceUrl as string });
  }
}