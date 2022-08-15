# App Runner sample project with CDK

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ContainerOnAWS_apprunner-cdk&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ContainerOnAWS_apprunner-cdk) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=ContainerOnAWS_apprunner-cdk&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=ContainerOnAWS_apprunner-cdk)

## Introduction

In this sample project, we will learn major features of App Runner.

![Architecture](./screenshots/architecture.png?raw=true)

## Objectives

Learn the features below using the CDK code:

* App Runner Service
* Container deployment with ECR image
* Container deployment with change from CodeCommit repository

## Table of Contents

1. Deploy VPC stack
2. Deploy IAM Role stack
3. Docker build, deploy ECR and CodeCommit repository stack
4. Deploy App Runner stack
5. Deploy with ECR image
6. Deploy with CodeCommit repository

## Prerequisites

```bash
npm install -g aws-cdk@2.32.1
npm install -g cdk-ecr-deployment@2.5.5

# install packages in the root folder
npm install
cdk bootstrap
```

Use the `cdk` command-line toolkit to interact with your project:

* `cdk deploy`: deploys your app into an AWS account
* `cdk synth`: synthesizes an AWS CloudFormation template for your app
* `cdk diff`: compares your app with the deployed stack
* `cdk watch`: deployment every time a file change is detected

## CDK Stack

|   | Stack                            |  Time To Complete |
|---|----------------------------------|-------------------|
| 1 | VPC                              | 3m 30s (optional)     |
| 2 | IAM roles                        | 1m      |
| 3 | ECR and CodeCommit repository including Docker build    | 4m      |
| 4 | App Runner                       | 6m      |
|   | Total                            | 11m (14m 30s with a new VPC) |

## Steps

Use the [deploy-all.sh](./deploy-all.sh) file if you want to deploy all stacks without prompt at a time.

### Step 1: VPC

Deploy a new VPC:

```bash
cd vpc
cdk deploy
```

[01-vpc/lib/vpc-stack.ts](./01-vpc/lib/vpc-stack.ts)

The VPC ID will be saved into the SSM Parameter Store(`/apprunner-cdk/vpc-id`) to refer from other stacks.

To use the existing VPC, use the `-c vpcId` context parameter or create SSM Parameter:

```bash
aws ssm put-parameter --name "/apprunner-cdk/vpc-id" --value "{existing-vpc-id}" --type String 
```

### Step 3: IAM Role

Create the App Ruller access Execution role for ECR.

```bash
cd ../02-iam-role
cdk deploy 
```

[02-iam-role/lib/02-iam-role-stack.ts](./02-iam-role/lib/02-iam-role-stack.ts)

### Step 3: ECR and CodeCommit repository

```bash
cd ../03-ecr-codecommit
cdk deploy --outputs-file ./cdk-outputs.json
cat ./cdk-outputs.json 
```

[03-ecr-codecommit/lib/ecr-codecommit-stack.ts](./03-ecr-codecommit/lib/ecr-codecommit-stack.ts)

### Step 4: App Runner Service

Crearte a App Runne Service.

```bash
cd ../04-apprunner
cdk deploy 
```

ecs-restapi-service refers the SSM parameters below:

* /apprunner-cdk/vpc-id
* /apprunner-cdk/access-arn

[04-apprunner/lib/apprunner-stack.ts](./04-apprunner/lib/apprunner-stack.ts)

**IMPORTANT**

If the ECS cluster was re-created, you HAVE to deploy after cdk.context.json files deletion with the below:

`find . -name "cdk.context.json" -exec rm -f {} \;`

## Clean Up

[clean-up.sh](./clean-up.sh)

## Structure

```text
├── build.gradle
├── package.json
├── ssm-prefix.ts
├── tsconfig.json
├── vpc
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   └── lib
│       └── vpc-stack.ts
├── ecs-fargate-cluster
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   ├── cluster-config.ts
│   │   └── ec2ecs-cluster-stack.ts
│   └── settings.yaml
├── 02-iam-role
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   └── lib
│       └── 02-iam-role-stack.ts
├── ecs-fargate-service-restapi
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   └── apprunner-stack.ts
├── ecs-fargatespot-service-restapi
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   └── ecs-fargatespot-service-restapi-stack.ts
├── app
│   ├── Dockerfile
│   ├── README.md
│   ├── build.sh
│   ├── flask_api.py
│   ├── gunicorn.config.py
│   └── requirements.txt
```

## Reference

* https://aws.github.io/copilot-cli/blogs/apprunner-vpc/

* https://aws.amazon.com/ko/blogs/containers/deep-dive-on-aws-app-runner-vpc-networking/

### Docs

* [AuthenticationConfiguration](https://docs.aws.amazon.com/apprunner/latest/api/API_AuthenticationConfiguration.html)

### CDK Lib

* [App Runner v2](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apprunner-readme.html)

* [App Runner v1](https://www.npmjs.com/package/@aws-cdk/aws-apprunner)

* [ECR Assets](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecr_assets-readme.html)

### IAM Role & Policy

* [Task Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)

* [Exec Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html)
