# lambda-optimize-image :camera:

Lambda function to optimize images uploaded to S3. Images uploaded to a source S3 bucket are optimized with [`sharp`](https://github.com/lovell/sharp) and uploaded to a destination bucket.

## Getting started

You will need an AWS account and the AWS CLI installed.

### AWS setup

- Create an AWS role with Permission Policy `AWSLambdaExecute` (this allows S3 GET and PUT and CloudWatch logging)
- Create two S3 buckets:
  - `bucket-name` (for source images)
  - `bucket-name-public` (for optimized images - in my setup, it is set up for public access)

### Deploy the Lambda function

- Clone this repo
- Run `npm install`
- Run `AWS_ROLE=arn:aws:iam::[account-id]:role/[role-name] npm run deploy` (this zips the function and deploys it to Lambda)

### Configure AWS events

- Allow the S3 source bucket to call the Lambda by running:
  ```bash
  aws lambda add-permission --function-name optimizeImage --principal s3.amazonaws.com \
  --statement-id s3invoke --action "lambda:InvokeFunction" \
  --source-arn arn:aws:s3:::[bucket-name] \
  --source-account [account-id]
  ```
- Check the newly created policy with `aws lambda get-policy --function-name optimizeImage`
- In the source bucket (`bucket-name`), go to `Properties` :arrow_right: `Events` :arrow_right: `Add notification`. Create a notification that sends `All object create events` to your Lambda function.

## Credits

- Lovell Fuller and contributors for the [`sharp`](https://github.com/lovell/sharp) image processing library
- Inspired by [Tutorial: Using AWS Lambda with Amazon S3](https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html)
