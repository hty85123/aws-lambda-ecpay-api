# aws-lambda-ecpay-api

This project demonstrates the integration of the **ECPay** payment gateway with a backend API built using **AWS Lambda** and deployed via **AWS Serverless Application Model (AWS SAM)**.

## Key Technologies:

- **ECPay**: A leading third-party payment gateway in Taiwan, ECPay provides services for credit card, ATM, and convenience store payments. It simplifies payment processing for online businesses and enables seamless transaction management.
- **AWS Lambda**: A serverless compute service from Amazon Web Services (AWS) that lets you run code without provisioning or managing servers. It automatically scales with demand and charges you only for the compute time you consume.
- **AWS SAM**: AWS Serverless Application Model (SAM) is an open-source framework that simplifies the development, deployment, and management of serverless applications. It extends AWS CloudFormation and provides a simplified syntax to define Lambda functions, APIs, databases, and event source mappings.

## Project Overview:

This project integrates **ECPay** with a backend API built on **AWS Lambda** to handle various payment-related transactions in a serverless architecture. The project is deployed and managed using **AWS SAM**, which streamlines the process of defining and deploying the necessary AWS resources, such as Lambda functions, API Gateway, and IAM roles.

### How the Integration Works:

- The backend API is hosted on **AWS Lambda**, ensuring that no traditional server infrastructure needs to be managed. Each API endpoint is connected to a specific Lambda function, which processes requests such as creating users, handling transactions, and interacting with the ECPay API.
- **ECPay** is integrated to facilitate payment processing. When a transaction is initiated, the project generates a unique **MerchantTradeNo** based on the transaction ID and a timestamp, which is then sent to ECPay to process payments securely.
- The project uses **AWS API Gateway** to expose the Lambda-based API to the outside world. API Gateway routes incoming HTTP requests to the appropriate Lambda functions, ensuring secure and scalable access to the API.
- The application leverages **AWS SAM** to define the infrastructure as code, making it easy to manage, deploy, and maintain the serverless application.

With this setup, the project efficiently handles payment processing, transaction management, and user interactions while benefiting from the scalability and cost-effectiveness of AWS Lambda and the robustness of ECPay.
