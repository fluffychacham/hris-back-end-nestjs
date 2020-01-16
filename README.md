[![Build Status](https://travis-ci.org/fluffychacham/hris-back-end-nestjs.svg?branch=master)](https://travis-ci.org/fluffychacham/hris-back-end-nestjs)


----------

# Getting started

## Installation
    
Install dependencies
    
    npm ci

Copy config file and set JsonWebToken secret key

    cp src/config.example.ts src/config.ts
    
----------

## Database

The codebase uses [Typeorm](http://typeorm.io/) with a MySQL database.

Create a new mysql database with the name `hrisapplication` (or the name you specified in the ormconfig.json)

Copy Typeorm config example file for database settings

    cp ormconfig.json.example ``
    
Set mysql database settings in ormconfig.json

    {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "username": "your-mysql-username",
      "password": "your-mysql-password",
      "database": "hrisapplication",
      "entities": ["src/**/**.entity{.ts,.js}"],
      "synchronize": true
    }
    
Start local mysql server and create new database 'hrisapplication'

On application start, tables for all entities will be created.

----------

## NPM scripts

- `npm start` - Start application
- `npm run start:watch` - Start application in watch mode
- `npm run test` - run Jest test runner 
- `npm run start:prod` - Build application

----------

## Start application

- `npm start`
- Test api with `http://localhost:4000/api` in the browser

----------

# Authentication
 
This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about JWT.

----------
 
# Swagger API docs

This repo uses the NestJS swagger module for API documentation. [NestJS Swagger](https://github.com/nestjs/swagger) - [www.swagger.io](https://swagger.io/)   

Swagger docs can be accessed by going to `http://localhost:4000/docs`