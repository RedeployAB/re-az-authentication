# re-az-authentication

Authenticate with the Azure REST API.

**Content**

* [Information](#information)
* [Install](#install)
* [Usage](#usage)

## Information

Small and lightweight module to handle authentication against the Azure REST API.

*Supported authentication styles (v0.1.0)*:

* Service Principals (Azure AD Applications)
* MSI (Managed Identity)

## Install

```
npm install re-az-authentication
```

## Usage

**Service Principals**

**With environment variables CLIENT_ID, CLIENT_SECRET and TENANT_ID set*
```js
const AZAuthentication = require('re-az-authentication');

// Promise chaining.
AZAuthentication.authenticateWithServicePrincipal()
  .then(credentials => {
    let headers: { Authorization: `Bearer ${credentials.access_token}`}
    return webreq.get('https://management.azure.com/subscriptions?api-version=2016-06-01', { headers: headers });
  })
  .then(subscriptions => {
      // And so on.
  })
  .catch(error => {
      console.log(error);
  });

// Async/Await.
let credentials, subscriptions;
try {
  credentials = await AZAuthentication.authenticateWithServicePrincipal();
  let headers: { Authorization: `Bearer ${credentials.access_token}`}
  subscriptions = await webreq.get('https://management.azure.com/subscriptions?api-version=2016-06-01', { headers: headers });
} catch (error) {
  console.log(error);
}
```

*To specify a specific resource to authenticate with, specify it in `options`*
```js
const AZAuthentication = require('re-az-authentication');

let credentials, secrets;
try {
  credentials = await AZAuthentication.authenticateWithServicePrincipal({resource: 'https://vault.azure.net'});
  let headers: { Authorization: `Bearer ${credentials.access_token}`}
  secrets = await webreq.get('https://<vault>.vault.azure.net/secrets?api-version=7.0', { headers: headers });
} catch (error) {
  console.log(error);
}

// Or with a predefined type.
let credentials, secrets;
try {
  credentials = await AZAuthentication.authenticateWithServicePrincipal({type: 'keyvault'});
  let headers: { Authorization: `Bearer ${credentials.access_token}`}
  secrets = await webreq.get('https://<vault>.vault.azure.net/secrets?api-version=7.0', { headers: headers });
} catch (error) {
  console.log(error);
}
```

**Managed Identity (MSI)**
```js
const AZAuthentication = require('re-az-authentication');

// Promise chaining.
AZAuthentication.authenticateWithMSI({type: 'keyvault'})
  .then(credentials => {
    let headers: { Authorization: `Bearer ${credentials.access_token}`}
    return webreq.get('https://<vault>.vault.azure.net/secrets?api-version=7.0', { headers: headers });
  })
  .then(secrets => {
      // And so on.
  })
  .catch(error => {
      console.log(error);
  });

// Async/Await.
let credentials, secrets;
try {
  credentials = await AZAuthentication.authenticateWithMSI({resource: 'https://vault.azure.net'});
  let headers: { Authorization: `Bearer ${credentials.access_token}`}
  secrets = await webreq.get('https://<vault>.vault.azure.net/secrets?api-version=7.0', { headers: headers });
} catch (error) {
  console.log(error);
}
```