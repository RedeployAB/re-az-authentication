'use strict';

const webreq = require('webreq');
let constants = require('./constants');

// Pre-configure webreq to always give full response.
webreq.bodyOnly = false;

/**
 * Represents Authentication against ARM.
 */
class AZAuthentication {
  constructor(options) {

    let opts = options !== undefined ? options : {};
    this.resource = _setResource(opts);
  }

  /**
   * Authenticate with Client ID and Client Secret of a Service Principal.
   * If not parameters are passed environment variables will be checked.
   * @param {string} [clientId] Client ID of Service Principal. Default: Checks CLIENT_ID.
   * @param {string} [clientSecret] Client Secret of Service Principal. Default: Checks CLIENT_SECRET.
   * @param {string} [tenantId] Tenant ID of Service Principal. Default: Checks TENANT_ID.
   * @param {string} [options] Options object.
   * @param {string} [options.resource] Specify which Azure Resource to authenticate with.
   * @param {string} [options.type] Specify which Azure Resource to authenticate with (predefined values).
   * @returns {Promise}
   */
  static async authenticateWithServicePrincipal(clientId, clientSecret, tenantId, options) {
    // Handle options.;
    if (clientId !== undefined && typeof clientId === 'object') {
      options = clientId;
      clientId = undefined;
    }
    // Throw if clientSecret or tentantId are options.
    if (typeof clientSecret === 'object' || typeof tenantId === 'object') {
      throw new Error('Either specify clientId, clientSecret, tentantId and options, or options only.');
    }
    let opts = options !== undefined ? options : {};
    // If no parameters are passed. Use environment variables.
    let cid = clientId !== undefined ? clientId : process.env['CLIENT_ID'];
    let cse = clientSecret !== undefined ? clientSecret : process.env['CLIENT_SECRET'];
    let tid = tenantId !== undefined ? tenantId : process.env['TENANT_ID'];

    if (!cid || !cse || !tid) {
      throw new Error('CLIENT_ID, CLIENT_SECRET and TENANT_ID must be set or provided.');
    }

    let grantType = "client_credentials";
    // URI encode client_id and client_secret.
    cid = encodeURIComponent(cid);
    cse = encodeURIComponent(cse);

    let resource = _setResource(opts);
    let body = `resource=${resource}&client_id=${cid}&client_secret=${cse}&grant_type=${grantType}`
    let uri = `https://login.microsoft.com/${tid}/oauth2/token`

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
   * @returns {Promise}
   */
  static async authenticateWithMSI(options) {

    let opts = options !== undefined ? options : {};
    let resource = opts.resource = _setResource(opts);

    let endpoint = process.env['MSI_ENDPOINT'];
    let secret = process.env['MSI_SECRET'];
    let id = process.env['MSI_CLIENT_ID'] || opts.clientId;

    if (!endpoint || !secret) {
      throw new Error('MSI_ENDPOINT and MSI_SECRET must be set.');
    }

    let clientId = id !== undefined ? `&clientid=${id}` : '';

    let uri = `${endpoint}?resource=${resource}${clientId}&api-version=2017-09-01`
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
 */
function _setResource(options) {

  let resource;
  if (options.resource !== undefined) {
    resource = options.resource;
  } else if (options.type !== undefined) {
    if (!Object.keys(constants.resource).includes(options.type)) {
      throw new Error('No such resource is predefined.');
    }
    resource = constants.resource[options.type];
  } else {
    resource = constants.resource['default'];
  }

  return resource;
}

module.exports = AZAuthentication;
