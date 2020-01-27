'use strict';

const webreq = require('webreq');
let constants = require('./constants');

/**
 * Represents Authentication against ARM.
 */
class AZAuthentication {
  constructor(options) {
    let opts = options ? options : {};
    let endpoints = setEndpoints(opts);

    this.resource = endpoints.resource;
    this.authenticationURL = endpoints.authenticationURL;
  }

  /**
   * Authenticate with Client ID and Client Secret of a Service Principal.
   * If not parameters are passed environment variables will be checked.
   * @param {string} [clientId] Client ID of Service Principal. Default: Checks AZURE_CLIENT_ID.
   * @param {string} [clientSecret] Client Secret of Service Principal. Default: Checks AZURE_CLIENT_SECRET.
   * @param {string} [tenantId] Tenant ID of Service Principal. Default: Checks AZURE_TENANT_ID.
   * @param {string} [options] Options object.
   * @param {string} [options.resource] Specify which Azure Resource to authenticate with.
   * @param {string} [options.type] Specify which Azure Resource to authenticate with (predefined values).
   * @param {string} [options.environment] Azure Environment to authenticate with (azure, azureUSGovernment,
   * azureGermany or azureChina).
   * @returns {Promise}
   */
  static async authenticateWithServicePrincipal(clientId, clientSecret, tenantId, options) {
    // Handle options.
    if (clientId && typeof clientId === 'object') {
      options = clientId;
      clientId = undefined;
    }
    // Throw if clientSecret or tentantId are options.
    if (typeof clientSecret === 'object' || typeof tenantId === 'object') {
      throw new Error('Either specify clientId, clientSecret, tentantId and options, or options only.');
    }

    let opts = options ? options : {};
    // If no parameters are passed. Use environment variables.
    let cid = clientId ? clientId : process.env['AZURE_CLIENT_ID'];
    let cse = clientSecret ? clientSecret : process.env['AZURE_CLIENT_SECRET'];
    let tid = tenantId ? tenantId : process.env['AZURE_TENANT_ID'];

    if (!cid || !cse || !tid) {
      throw new Error('AZURE_CLIENT_ID, AZURE_CLIENT_SECRET and AZURE_TENANT_ID must be set or provided.');
    }

    let grantType = "client_credentials";
    // URI encode client_id and client_secret.
    cid = encodeURIComponent(cid);
    cse = encodeURIComponent(cse);

    let endpoints = setEndpoints(opts);
    let body = `resource=${endpoints.resource}&client_id=${cid}&client_secret=${cse}&grant_type=${grantType}`;
    let uri = `${endpoints.authenticationURL}/${tid}/oauth2/token`;

    let reqOptions = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }

    let res;
    try {
      res = await webreq.post(uri, reqOptions);
      if (res.statusCode !== 200) {
        throw new Error(res.body.error_description);
      }
    } catch (error) {
      throw error;
    }

    return res.body;
  }


  /**
   * Authenticates with Managed Identity.
   * Checks for environment variables MSI_ENDPONT and MSI_SECRET.
   * Default behaviour is using system assigned identity, specifying client id in the
   * options or setting environment variable MSI_CLIENT_ID will use user assigned identity.
   * @param {string} [options] Options object.
   * @param {string} [options.clientId] Client ID of user assigned identity.
   * @param {string} [options.resource] Specify which Azure Resource to authenticate with.
   * @param {string} [options.type] Specify which Azure Resource to authenticate with (predefined values).
   * @param {string} [options.environment] Azure Environment to authenticate with (azure, azureUSGovernment,
   * azureGermany or azureChina).
   * @returns {Promise}
   */
  static async authenticateWithMSI(options) {
    let opts = options ? options : {};

    let endpoint = process.env['MSI_ENDPOINT'];
    let secret = process.env['MSI_SECRET'];
    let id = process.env['MSI_CLIENT_ID'] || opts.clientId;

    if (!endpoint || !secret) {
      throw new Error('MSI_ENDPOINT and MSI_SECRET must be set.');
    }

    let clientId = id ? `&clientid=${id}` : '';

    let endpoints;
    if (opts.resource || opts.type || opts.environment) {
      endpoints = setEndpoints(opts);
    } else {
      endpoints = { resource: this.resource, authenticationURL: this.authenticationURL };
    }

    let uri = `${endpoint}?resource=${endpoints.resource}${clientId}&api-version=2017-09-01`;
    let reqOptions = { headers: { Secret: secret } };

    let res;
    try {
      res = await webreq.get(uri, reqOptions);
      if (res.statusCode !== 200) {
        throw new Error('Could not authenticate with MSI.');
      }
    } catch (error) {
      throw error;
    }

    return res.body;
  }
}

/**
 * Sets resource by either direct value, or by type. Types are defined in constants.js.
 * @param {string} [options] Options object.
 * @param {string} [options.resource] Specify which Azure Resource to authenticate with.
 * @param {string} [options.type] Specify which Azure Resource to authenticate with (predefined values).
 * @param {string} [options.environment] Azure Environment to authenticate with (azure, azureUSGovernment,
 * azureGermany or azureChina).
 * @returns {object} Object containing { resource: '', authenticationURL: '' }.
 */
function setEndpoints(options) {
  let environment = options.environment
    ? constants.environments[options.environment]
    : constants.environments.azure;

  let resource;
  if (options.resource) {
    resource = options.resource;
  } else if (options.type) {
    if (!Object.keys(environment).includes(options.type)) {
      throw new Error('No such resource is predefined.');
    }
    resource = environment[options.type];
  } else {
    resource = environment['default'];
  }

  return {
    resource: resource,
    authenticationURL: environment.activeDirectoryAuthority
  };
}

AZAuthentication.AZURE = 'azure';
AZAuthentication.AZURE_US_GOVERNMENT = 'azureUSGovernment';
AZAuthentication.AZURE_GERMANY = 'azureGermany';
AZAuthentication.AZURE_CHINA = 'azureChina'

module.exports = AZAuthentication;
