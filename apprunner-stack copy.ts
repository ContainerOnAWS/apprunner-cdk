// import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
// import { Construct } from 'constructs';

// import * as apprunner from 'aws-cdk-lib/aws-apprunner';
// import * as iam from 'aws-cdk-lib/aws-iam';

// import { StackCommonProps, SSM_PREFIX } from '../../config';

// /** */
// export class AppRunnerStack extends Stack {
//   constructor(scope: Construct, id: string, props: StackCommonProps) {
//     super(scope, id, props);

//     // const service = apprunner.CfnService

//     const serviceName = `apprunnder-${props.stage}`;
//     const ecrUrl = `${props.env?.account}.dkr.ecr.${props.env?.region}.amazonaws.com/fargate-restapi-${props.stage}:latest`;

//     const taskExecutionRole = new iam.Role(this, 'task-execution-role', {
//       roleName: 'AppRunnerEcrAccessRole',
//       assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com"'),
//       managedPolicies: [
//         iam.ManagedPolicy.fromAwsManagedPolicyName(
//           'service-role/AmazonECSTaskExecutionRolePolicy',
//         ),
//       ]
//     });

//     const cfnService = new apprunner.CfnService(this, 'cfn-service', {
//       sourceConfiguration: {
//           authenticationConfiguration: {
//             accessRoleArn: taskExecutionRole.roleArn,
//         //     connectionArn: 'connectionArn',
//           },
//         autoDeploymentsEnabled: false,
//         // codeRepository: {
//         //   repositoryUrl: ecrUrl,
//         //   sourceCodeVersion: {
//         //     type: 'BRANCH',
//         //     value: 'master',
//         //   },
//         //   codeConfiguration: {
//         //     configurationSource: 'API',
//         //     codeConfigurationValues: {
//         //       runtime: 'corretto11',
//         //       buildCommand: './gradlew build',
//         //       port: '8080',
//         //       runtimeEnvironmentVariables: [{
//         //         name: 'name',
//         //         value: 'value',
//         //       }],
//         //       startCommand: 'java -Djava.security.egd=file:/dev/./urandom -jar ./build/libs/devops-java-gradle.jar',
//         //     },
//         //   },
//         // },
//         imageRepository: {
//           imageRepositoryType: 'ECR',
//           imageIdentifier: ecrUrl,
//           imageConfiguration: {
//             port: '8080',
//             runtimeEnvironmentVariables: [{
//               name: 'stage',
//               value: props.stage,
//             }],
//             // startCommand: 'startCommand',
//           },
//         },
//       },
//       healthCheckConfiguration: {
//         healthyThreshold: 2,
//         unhealthyThreshold: 5,
//         timeout: 19,
//         interval: 20,
//         path: '/',
//         protocol: 'HTTP'
//       },
//       // instanceConfiguration: {
//       //   cpu: 'cpu',
//       //   instanceRoleArn: 'instanceRoleArn',
//       //   memory: 'memory',
//       // },
//       // networkConfiguration: {
//       //   egressConfiguration: {
//       //     egressType: 'egressType',

//       //     // the properties below are optional
//       //     vpcConnectorArn: 'vpcConnectorArn',
//       //   },
//       // },
//       // observabilityConfiguration: {
//       //   observabilityEnabled: false,

//       //   // the properties below are optional
//       //   observabilityConfigurationArn: 'observabilityConfigurationArn',
//       // },
//       serviceName,
//       tags: [{
//         key: 'stage',
//         value: props.stage,
//       }],
//     });
//     // const parameter = new ssm.StringParameter(this, 'SSMVPCID', { parameterName: `${SSM_PREFIX}/vpc-id`, stringValue: vpc.vpcId });
//     // new CfnOutput(this, 'VPC', { value: vpc.vpcId });
//     // new CfnOutput(this, 'SSMParameter', { value: parameter.parameterName });
//     // new CfnOutput(this, 'SSMParameterValue', { value: vpc.vpcId });
//     // new CfnOutput(this, 'SSMURL', { value: `https://${this.region}.console.aws.amazon.com/systems-manager/parameters/` });
//   }
// }