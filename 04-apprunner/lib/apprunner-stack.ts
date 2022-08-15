import { Stack, CfnOutput, Lazy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { StackCommonProps, SSM_PREFIX } from '../../config';

/**
 * Deploy with ECR image that created using ecr-codecommit stack
 */
export class AppRunnerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackCommonProps) {
    super(scope, id, props);

    const serviceName = `apprunnder-${props.stage}`;
    const ecrUrl = `${props.env?.account}.dkr.ecr.${props.env?.region}.amazonaws.com/${serviceName}:latest`;

    const accessRoleArn = ssm.StringParameter.valueFromLookup(this, `${SSM_PREFIX}/access-role-arn`);
    const vpcId = ssm.StringParameter.valueFromLookup(this, `${SSM_PREFIX}/vpc-id`);
    const vpc = ec2.Vpc.fromLookup(this, 'vpc', { vpcId });

    let privateSubnetIds: string[] = [];
    for (const subnet of vpc.privateSubnets) {
      privateSubnetIds.push(subnet.subnetId);
    }
    const vpcConnector = new apprunner.CfnVpcConnector(this, 'vpc-connector', {
      vpcConnectorName: `vpcct-${serviceName}`,
      subnets: privateSubnetIds,
    });

    const cfnService = new apprunner.CfnService(this, 'service', {
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
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
    });

    new CfnOutput(this, 'ServiceName', { value: cfnService.serviceName as string });
    new CfnOutput(this, 'ServiceURL', { value: `https://${cfnService.attrServiceUrl}` });
  }
}