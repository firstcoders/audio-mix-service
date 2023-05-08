# General

A serverless microservice that mixes/merges multiple audio files into a single file with different volumes for each audio file.

## Contributing

> This repo is a subtree split of our monorepo which will be made public in due course. We cannot process any pull-requests to this repo. Please contact us for help.

# Requirements

Installation of this service requires an AWS account and IAM credentials with appropriate permissions.

# Installation

```shell
npm install @soundws/audio-mix-service
```

or using yarn

```shell
yarn add @soundws/audio-mix-service
```

# Deployment

Please refer to the AWS SAM documentation on how to deploy [AWS SAM applications](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-deploying.html)

Refer to the `dist/template.yaml` file for information on the cloudformation deployment parameters.

Note that deployment of this service depends on a lambda layer provided via the parameter `AudioToolsLayerArn`. Please refer to the `Audio Tools Lambda Layer` documentation.

# TODO

- rewrite in ESM

# License

Copyright (C) 2019-2023 First Coders LTD

This software package is available under a commercial license.

Unauthorized distribution or use of this software, via any medium is strictly prohibited.

Proprietary.
