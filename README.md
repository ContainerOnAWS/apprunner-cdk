# Sample project for ECS Fargate with CDK

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ContainerOnAWS_ecs-fargate-cdk&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ContainerOnAWS_ecs-fargate-cdk) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=ContainerOnAWS_ecs-fargate-cdk&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=ContainerOnAWS_ecs-fargate-cdk)

## Introduction

In this sample project, we will learn major features of ECS Fargate and Fargate Spot.

![Architecture](./screenshots/fargate-architecture.png?raw=true)

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
| 3 | ECR and CodeCommit repository    | 2m      |
| 4 | App Runner                       | 3m      |
|   | Total                            | 6m (9m 30s with a new VPC) |

## Steps

Use the [deploy-all.sh](./deploy-all.sh) file if you want to deploy all stacks without prompt at a time.

### Step 1: VPC

Deploy a new VPC:

```bash
cd vpc
cdk deploy
```

[vpc/lib/vpc-stack.ts](./vpc/lib/vpc-stack.ts)

The VPC ID will be saved into the SSM Parameter Store(`/cdk-ecs-fargate/vpc-id`) to refer from other stacks.

To use the existing VPC, use the `-c vpcId` context parameter or create SSM Parameter:

```bash
aws ssm put-parameter --name "/cdk-ecs-fargate/vpc-id" --value "{existing-vpc-id}" --type String 
```

### Step 2: ECS cluster

```bash
cd ../ecs-fargate-cluster
cdk deploy 

# or define your VPC id with context parameter
cdk deploy -c vpcId=<vpc-id>
```

SSM parameter:

* /cdk-ecs-fargate/vpc-id

Cluster Name: [ecs-fargate-cluster/lib/cluster-config.ts](./ecs-fargate-cluster/lib/cluster-config.ts)

[ecs-fargate-cluster/lib/ecs-fargate-cluster-stack.ts](./ecs-fargate-cluster/lib/ecs-fargate-cluster-stack.ts)

### Step 3: IAM Role


Create the ECS Task Execution role and default Task Role.

* AmazonECSFargateTaskExecutionRole
* ECSFargateDefaultTaskRole including a policy for ECS Exec

```bash
cd ../iam-role
cdk deploy 
```

[ecs-iam-role/lib/ecs-iam-role-stack.ts](./ecs-iam-role/lib/ecs-iam-role-stack.ts)

### Step 4: ECR and CodeCommit repository

```bash
cd ../ecr-codecommit
cdk deploy --outputs-file ./cdk-outputs.json
cat ./cdk-outputs.json 
```

[ecr-codecommit/lib/ecr-codecommit-stack.ts](./ecr-codecommit/lib/ecr-codecommit-stack.ts)

### Step 5: ECS Service

Crearte a Fargate Service, Auto Scaling, ALB, and Log Group.

```bash
cd ../ecs-restapi-service
cdk deploy 
```

ecs-restapi-service refers the SSM parameters below:

* /cdk-ecs-fargate/vpc-id
* /cdk-ecs-fargate/task-execution-role-arn

[ecs-fargate-service-restapi/lib/ecs-fargate-service-restapi-stack.ts](./ecs-fargate-service-restapi/lib/ecs-fargate-service-restapi-stack.ts)

**IMPORTANT**

If the ECS cluster was re-created, you HAVE to deploy after cdk.context.json files deletion with the below:

`find . -name "cdk.context.json" -exec rm -f {} \;`

### Step 7: Scale the Tasks

```bash
aws ecs update-service --cluster fargate-dev --service fargate-restapi-dev --desired-count 10

aws ecs update-service --cluster fargate-dev --service fargatespot-restapi-dev --desired-count 10
```

### Step 9: ECS deploy with Code Pipeline

Commit ./app folder files to your new Code Commit repository:

```bash
PROJECT_ROOT=$(pwd)
echo $PROJECT_ROOT

CODECOMMIT_REPO_URL=$(cat ecr-codecommit/cdk-outputs.json | jq '."ecr-fargate-restapi-dev".CodeCommitRepoUrl'| cut -d '"' -f2)
echo $CODECOMMIT_REPO_URL
cd ../
git clone ${CODECOMMIT_REPO_URL}
CODECOMMIT_ROOT=$(pwd)/fargate-restapi-dev

cp ${PROJECT_ROOT}/app/* ${CODECOMMIT_ROOT}/
cd ${CODECOMMIT_ROOT}
git add .
git commit -m "code pipeline"
git push 
```

Create a GitHub token on `Settings >  Developer settings` menu and create a secret:

https://github.com/settings/tokens

```bash
aws secretsmanager create-secret --name '/github/token' --secret-string {your-token}

cd ../code-pipeline
cdk deploy 
```

SSM parameters:

* /cdk-ecs-fargate/ecr-repo-arn
* /cdk-ecs-fargate/ecr-repo-name
* /cdk-ecs-fargate/cluster-securitygroup-id
* /cdk-ecs-fargate/cluster-name
* /cdk-ecs-fargate/codecommit-arn

[code-pipeline/lib/ecs-codedeploy-stack.ts](./code-pipeline/lib/ecs-codedeploy-stack.ts)

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
├── ecs-iam-role
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   └── lib
│       └── ecs-iam-role-stack.ts
├── ecs-fargate-service-restapi
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   └── ecs-fargate-service-restapi-stack.ts
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

* [GitHub - aws-containers](https://github.com/aws-containers)

https://aws.amazon.com/ko/blogs/containers/deep-dive-on-aws-app-runner-vpc-networking/

### Docs

* [AuthenticationConfiguration](https://docs.aws.amazon.com/apprunner/latest/api/API_AuthenticationConfiguration.html)

### CDK Lib

* [App Runner v2](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apprunner-readme.html)

* [App Runner v1](https://www.npmjs.com/package/@aws-cdk/aws-apprunner)

* [ECR Assets](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecr_assets-readme.html)

### IAM Role & Policy

* [Task Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)

* [Exec Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html)
