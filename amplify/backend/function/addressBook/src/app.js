/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const { v4: uuidv4 } = require('uuid')

const axios = require('axios');

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "AddressBookTable";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "pk";
const partitionKeyType = "S";
const sortKeyName = "sk";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/address-book";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/************************************
* HTTP Get method to list objects *
************************************/

app.get(path, async function(req, res) {
  console.log('---------------Querying for users address book entries---------');

  const user = await authentication(req);
  const { Username: userId } = user;

  // TODO Update once we have real user ids
  let queryParams = {
    TableName: tableName,
    KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
    ExpressionAttributeNames:{
      "#pk": "pk",
      "#sk": 'sk'
    },
    ExpressionAttributeValues: {
      ":pk": `user${userId}-addressBookEntry`,
      ":sk": `user${userId}-addressBookEntry`,
    },
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    console.log('---------------got data----------', data);
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});

// TODO move this to it's own component
const authentication = async (req) => {
  console.log('----------------DOES IT HAVE A TOKEN----', req.headers);
  console.log('----------------DOES IT HAVE A TOKEN----', req.authorization);
  const COGNITO_URL = `https://cognito-idp.us-east-1.amazonaws.com/`;

  try {
      const accessToken = req.headers.authorization.split(" ")[1];

      const { data } = await axios.post(
          COGNITO_URL,
          {
              AccessToken: accessToken
          },
          {
              headers: {
                  "Content-Type": "application/x-amz-json-1.1",
                  "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser"
              }
          }
      )

    console.log('---------What is goin on----------');

      req.user = data;
      return data;
  } catch (error) {
    console.log('---------WHAT IS OUR ERROR----------');

    console.log('---------WHAT IS OUR ERROR----------', error);
    throw new Error("return a 401 here");
  }
};

/************************************
 * HTTP Get method to query objects *
 ************************************/

app.get(path + hashKeyPath, async function(req, res) {
  console.log('---------------get path to query----------');

  const condition = {}
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  } else {
    try {
      condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + '/object' + hashKeyPath + sortKeyPath, async function(req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let getItemParams = {
    TableName: tableName,
    Key: params
  }

  try {
    const data = await ddbDocClient.send(new GetCommand(getItemParams));
    if (data.Item) {
      res.json(data.Item);
    } else {
      res.json(data) ;
    }
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});


/************************************
* HTTP put method for insert object *
*************************************/

app.put(path, async function(req, res) {

  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }
  try {
    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({ success: 'put call succeed!', url: req.url, data: data })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

/************************************
* HTTP post method for insert object *
*************************************/

app.post(path, async function(req, res) {
  try {
    console.log('---------ENTERED OUR POST-------------', req);
    console.log('--------req.apiGateway.event.requestContext.identity.cognitoIdentityId-------------', req.apiGateway.event.requestContext.identity.cognitoIdentityId);

    const user = await authentication(req);
    console.log('-------ANY THING----', user);
    const { Username: userId } = user;
    console.log('-----userId----', userId);
    if (userIdPresent) {
      req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
    }

    if (!req.body.title || !req.body.text) {
      console.log('---------got a bad request here-------------', req.body);
      throw new Error("Bad Request");
    }

    let addressId;
    const existingAddressId = req.query['addressId'];

    if (existingAddressId) {
      addressId = existingAddressId;
    } else {
      addressId = uuidv4();
    }

    // update when we have user ids to include in dynamo object
    const dynamoAddressEntry = {
      pk: `user${userId}-addressBookEntry`,
      sk: `user${userId}-addressBookEntry${addressId}`,
      attrs: {
        id: addressId,
        title: req.body.title,
        text: req.body.text
      }
    }


    let putItemParams = {
      TableName: tableName,
      Item: dynamoAddressEntry
    }

    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    console.log('---------Hooray we got a success-------------', data);
    res.json({ success: 'post call succeed!', url: req.url, data: data })
  } catch (err) {
    console.log('---------Error error--------', err);
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

/**************************************
* HTTP remove method to delete object *
***************************************/

app.delete(path, async function(req, res) {
//app.delete(path + '/object' + hashKeyPath + sortKeyPath, async function(req, res) {
  const params = {};
  // if (userIdPresent && req.apiGateway) {
  //   params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  // } else {
  //   params[partitionKeyName] = req.params[partitionKeyName];
  //    try {
  //     params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }
  // if (hasSortKey) {
  //   try {
  //     params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }
  
  console.log('---------Got our delete request---------', req.params);
  console.log('---------The request--query ?-------', req.query);
  console.log('---------The request---------', req);

  const user = await authentication(req);
  const { Username: userId } = user;

  // TODO replace this hard coded user id
  params[partitionKeyName] = convertUrlType(`user${userId}-addressBookEntry`, partitionKeyType);
  params[sortKeyName] = convertUrlType(`user${userId}-addressBookEntry${req.query['addressId']}`, sortKeyType);

  if (!params.pk) {
    throw new Error("Bad Request");
  }

  let removeItemParams = {
    TableName: tableName,
    Key: params
  }

  console.log('-------------removeItemParams-------', removeItemParams)

  try {
    let data = await ddbDocClient.send(new DeleteCommand(removeItemParams));
    console.log('-------GOT A SUCCESS-------');

    res.json({url: req.url, data: data});
  } catch (err) {
    console.log('-------GOT AN ERROR-------', err);
    res.statusCode = 500;
    res.json({error: err, url: req.url});
  }
});

app.listen(3000, function() {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app