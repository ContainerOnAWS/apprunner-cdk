import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { SSM_PREFIX } from '../../config';

export class AppRunnerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // const service = apprunner.CfnService
        
        const cfnService = new apprunner.CfnService(this, 'cfn-service', {
            sourceConfiguration: {
            //   authenticationConfiguration: {
            //     accessRoleArn: 'accessRoleArn',
            //     connectionArn: 'connectionArn',
            //   },
              autoDeploymentsEnabled: false,
              codeRepository: {
                repositoryUrl: 'repositoryUrl',
                sourceCodeVersion: {
                  type: 'type',
                  value: 'value',
                },
          
                // the properties below are optional
                codeConfiguration: {
                  configurationSource: 'configurationSource',
          
                  // the properties below are optional
                  codeConfigurationValues: {
                    runtime: 'runtime',
          
                    // the properties below are optional
                    buildCommand: 'buildCommand',
                    port: 'port',
                    runtimeEnvironmentVariables: [{
                      name: 'name',
                      value: 'value',
                    }],
                    startCommand: 'startCommand',
                  },
                },
              },
              imageRepository: {
                imageIdentifier: 'imageIdentifier',
                imageRepositoryType: 'imageRepositoryType',
          
                // the properties below are optional
                imageConfiguration: {
                  port: 'port',
                  runtimeEnvironmentVariables: [{
                    name: 'name',
                    value: 'value',
                  }],
                  startCommand: 'startCommand',
                },
              },
            },
          
            // // the properties below are optional
            // autoScalingConfigurationArn: 'autoScalingConfigurationArn',
            // encryptionConfiguration: {
            //   kmsKey: 'kmsKey',
            // },
            // healthCheckConfiguration: {
            //   healthyThreshold: 123,
            //   interval: 123,
            //   path: 'path',
            //   protocol: 'protocol',
            //   timeout: 123,
            //   unhealthyThreshold: 123,
            // },
            // instanceConfiguration: {
            //   cpu: 'cpu',
            //   instanceRoleArn: 'instanceRoleArn',
            //   memory: 'memory',
            // },
            // networkConfiguration: {
            //   egressConfiguration: {
            //     egressType: 'egressType',
          
            //     // the properties below are optional
            //     vpcConnectorArn: 'vpcConnectorArn',
            //   },
            // },
            // observabilityConfiguration: {
            //   observabilityEnabled: false,
          
            //   // the properties below are optional
            //   observabilityConfigurationArn: 'observabilityConfigurationArn',
            // },
            serviceName: 'serviceName',
            tags: [{
              key: 'key',
              value: 'value',
            }],
          });
        // const parameter = new ssm.StringParameter(this, 'SSMVPCID', { parameterName: `${SSM_PREFIX}/vpc-id`, stringValue: vpc.vpcId });
        // new CfnOutput(this, 'VPC', { value: vpc.vpcId });
        // new CfnOutput(this, 'SSMParameter', { value: parameter.parameterName });
        // new CfnOutput(this, 'SSMParameterValue', { value: vpc.vpcId });
        // new CfnOutput(this, 'SSMURL', { value: `https://${this.region}.console.aws.amazon.com/systems-manager/parameters/` });
    }
}