# aws-lambda-ecpay-api

This project integrates **ECPay** with a backend API built on **AWS Lambda** to handle various payment-related transactions in a serverless architecture. The project is deployed and managed using **AWS Serverless Application Model (AWS SAM)**, which streamlines the process of defining and deploying the necessary AWS resources, such as Lambda functions, API Gateway, and IAM roles.

## Key Technologies:

- **ECPay**: A common used third-party payment gateway in Taiwan. It simplifies payment processing for online businesses and enables seamless transaction management. Refer to [here](https://developers.ecpay.com.tw/?page_id=26797) to get ECPay API Docs.
- **AWS Lambda**: A serverless compute service from Amazon Web Services (AWS) that lets you run code without provisioning or managing servers. It automatically charges you only for the compute time you consume.
- **AWS SAM**: AWS Serverless Application Model (SAM) is a framework that simplifies the development, deployment, and management of serverless applications. It extends AWS CloudFormation and provides a simplified syntax to define Lambda functions, APIs, databases, and event source mappings.

## How to Run the Demo

This section provides instructions on how to run the `my-app` React frontend to view a working demo that interacts with a backend powered by AWS Lambda and an already configured database.


### Steps to Run

1. **Clone the Repository**
Start by cloning this repository to your local machine:
```bash
git clone https://github.com/hty85123/aws-lambda-ecpay-api.git
2. **Start the Development Server**
