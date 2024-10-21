# aws-lambda-ecpay-api

This project integrates **ECPay** with a backend API built on **Amazon Web Services (AWS) Lambda** to handle various payment-related transactions in a serverless architecture. The project is deployed and managed using **AWS Serverless Application Model (AWS SAM)**, which streamlines the process of defining and deploying the necessary AWS resources, such as Lambda functions, API Gateway, and IAM roles.

## Key Technologies:

- **ECPay**: A common used third-party payment gateway in Taiwan. It simplifies payment processing for online businesses and enables seamless transaction management. Refer to [here](https://developers.ecpay.com.tw/?page_id=26797) to get ECPay API Docs.
- **AWS Lambda**: A serverless compute service from AWS that lets you run code without provisioning or managing servers. It automatically charges you only for the compute time you consume.
- **AWS SAM**: AWS SAM is a framework that simplifies the development, deployment, and management of serverless applications. It extends AWS CloudFormation and provides a simplified syntax to define Lambda functions, APIs, databases, and event source mappings.

## Demo

### Prerequisites

Before running the app, ensure you have the following installed:
- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) 

### Steps to Run Demo


1. **Clone the Repository**
   
   ```bash
   git clone https://github.com/hty85123/aws-lambda-ecpay-api.git
   ```

2. **Start the Development Server**

   ```bash
   cd my-app
   npm install
   npm start
   ```

### Demo Description

The React frontend is connected to a backend powered by AWS Lambda and a MySQL database on AWS RDS. The backend is already deployed, and no additional backend setup is required on your end.

Please note that this demo is powered by AWS Lambda, which may result in some latency due to the nature of serverless functions. While the performance may not be as fast as traditional server-based backends, it is sufficient to demonstrate how to integrate ECPay with AWS Lambda and AWS SAM for a fully serverless architecture. The focus of this demo is to showcase the functionality and architecture, rather than speed.

## ECPay related Lambda function

### 1. requestPayment.mjs
It is is responsible for initiating the payment process. It generates the necessary parameters, such as the MerchantTradeNo and TotalAmount, and sends a request to ECPay's API to start a payment transaction. This function ensures that the user is redirected to the ECPay payment gateway with the correct payment details for further processing.
### 2. return.mjs
It handles ECPay's server-side callback (also known as the "payment result notification"). After the user completes the payment, ECPay sends a notification to this endpoint to inform your system about the payment result (success, failure, etc.). This function validates the response, updates the transaction status in your database, and ensures that the transaction record reflects the outcome of the payment.
### 3. clientReturn.mjs
It deals with ECPay's client-side return URL. Once the user finishes their payment, they are redirected back to your website or application. This function is responsible for displaying a confirmation page to the user, typically thanking them for their payment and providing any relevant order or transaction information.

## Deploy AWS Lambda Functions using SAM

This section provides detailed steps for deploying the Lambda functions provided in the `my-sam-app` directory using AWS SAM.

### Prerequisites
Before you start deploying the backend, ensure you have the following:
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured with your AWS credentials.
- [AWS SAM CLI](https://aws.amazon.com/serverless/sam/) installed for packaging and deploying serverless applications.
- Access to AWS services such as Lambda, API Gateway, and RDS.
- A MySQL-compatible RDS database instance created in AWS to store your application data.

### 1. Install AWS SAM
To get started with AWS SAM, you'll need to install the SAM CLI.

### 2. Set Up AWS RDS
Before deploying the application, you need to set up an RDS instance. Here's how:

1. Go to the AWS RDS console and create a MySQL database instance.
2. Note the Security Group Ids, Subnet Ids, endpoint, username, password, and database name for the RDS instance. You will need these for configuration.

In your *template.yaml* file, under *VpcConfig* and *Environment* for each Lambda function, update the following environment variables with your RDS details:
   ```template.yaml
   VpcConfig: #Add Your VPC Configuration
     SecurityGroupIds:
       - sg-xxxxxxxxxxxxxxxxx #The ID of security group for MySQL
     SubnetIds:
       - subnet-xxxxxxxxxxxxxxxxx # The common subnet for Lambda and MySQL/Redis
       - subnet-xxxxxxxxxxxxxxxxx # Another subnet
       - subnet-xxxxxxxxxxxxxxxxx # The other subnet
   Environment: # ENV variable
     Variables:
       RDS_HOSTNAME: your-api-endpoint.com  # Endpoint of the RDS instance
       RDS_USERNAME: your-RDS-username # Master username for the RDS instance
       RDS_PASSWORD: your-RDS-password # Master password for the RDS instance
       RDS_DATABASE: your-target-DB #target DB in your RDS instance
   ```

The application uses a simple schema with two main tables: Users and Transactions. Below is an overview of the schema:
1. Users Table
   ```SQL
   CREATE TABLE Users (
     user_id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     balance INT DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
2. Transactions Table
   ```SQL
   CREATE TABLE Transactions (
     transaction_id VARCHAR(50) PRIMARY KEY,
     user_id INT,
     transaction_type ENUM('deposit', 'withdraw'),
     amount INT,
     status ENUM('pending', 'completed', 'failed'),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
   );
   ```

You can use your preferred database management tool (e.g., MySQL Workbench) to run these SQL statements and create the necessary tables.

### 3. Deploy the Backend using AWS SAM
   ```bash
   cd my-sam-app
   sam build
   sam deploy --guided
   ```

### 4. Update your-api-endpoint in requestPayment.mjs (Lambda function) and API_ID in App.js (React)
Once the API Gateway for your backend is deployed, you'll need to update the requestPayment Lambda function with the correct API endpoint.
```requestPayment.mjs
const HOST = "https://your-api-endpoint.com/Prod"; // Your AWS API endpoint
```
You'll also need to update the API endpoints in the React frontend
```App.js
const API_ID = "cz7axg7qk9"; //Replace it to your API_ID. Check your API_ID in the API Gateway console.
```
This setup will give you a fully functional backend API integrated with ECPay, using AWS Lambda and RDS for data storage.
