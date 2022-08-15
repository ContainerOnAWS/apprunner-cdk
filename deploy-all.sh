find . -name "cdk.context.json" -exec rm -f {} \;

echo "[1/4] Deploy 01-vpc"
cd ./01-vpc
cdk deploy --require-approval never

echo "[2/4] Deploy 02-iam-role"
cd ../02-iam-role
cdk deploy --require-approval never

echo "[3/4] Deploy 03-ecr-codecommit"
cd ../03-ecr-codecommit
cdk deploy --require-approval never --outputs-file ./cdk-outputs.json
cat ./cdk-outputs.json 

echo "[4/4] Deploy 04-apprunner"
cd ../04-apprunner
cdk deploy --require-approval never
