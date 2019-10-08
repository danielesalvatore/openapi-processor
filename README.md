# OpenAPI processor

Tool that makes APIs migration to AWS API gateway simple. Start from a OpenAPI-compliant APIs specification and convert it to an enhanced AWS API Gateway specification.

## Get started
1. Provide an OpenAPI-compliant APIs specification
2. Duplicate the `.env.example` file, and name the cloned file as `.env`
3. Replace the example `.env` configurations with the desired values
4. Run `npm start` command to generate the APIs specification files and the CloudFormation template (CFT) to deploy your APIs
5. The output files (APIs specification & CFT) will be placed within the output folder, specified in `.env`

## What should I configure?
`.env.example` contains the descriptions of all the available configuration