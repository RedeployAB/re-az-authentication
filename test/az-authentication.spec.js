'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const webreq = require('webreq');
const AZAuthentication = require('../lib/az-authentication');

describe('AZAuthentication', () => {

  describe('class instantiation', () => {

    it('should set the deault resource if no parameters are provided', () => {
      let azAuth = new AZAuthentication();
      expect(azAuth.resource).to.equal('https://management.core.windows.net/');
    });

    it('should set resource from options.resource', () => {
      let azAuth = new AZAuthentication({ resource: 'https://vault.azure.net' });
      expect(azAuth.resource).to.equal('https://vault.azure.net');
    });

    it('should set resource from options.type', () => {
      let azAuth = new AZAuthentication({ type: 'keyvault' });
      expect(azAuth.resource).to.equal('https://vault.azure.net');
    });

    it('should throw if options.type is used, and no such value exists', (done) => {
      expect(() => { new AZAuthentication({ type: 'nonexistant' }) }).to.throw('No such resource is predefined.');
      done();
    });
  });

  describe('autneticateServicePrincipal()', () => {

    let env;

    beforeEach(() => {
      env = process.env;
      process.env = {};
    });

    afterEach(() => {
      process.env = env;
      webreq.post.restore();
    });

    it('should handle authentication with a Service Princial, environment variables set', () => {

      process.env['CLIENT_ID'] = 'aaaa';
      process.env['CLIENT_SECRET'] = 'abcdefg';
      process.env['TENANT_ID'] = 'bbbb';

      sinon.stub(webreq, 'post').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithServicePrincipal()
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle authentication with a Service Princial, environment variables set, with options.resource', () => {

      process.env['CLIENT_ID'] = 'aaaa';
      process.env['CLIENT_SECRET'] = 'abcdefg';
      process.env['TENANT_ID'] = 'bbbb';

      sinon.stub(webreq, 'post').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithServicePrincipal({ resource: 'https://vault.azure.net' })
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle authentication with a Service Princial, environment variables set, with options.resource', () => {

      process.env['CLIENT_ID'] = 'aaaa';
      process.env['CLIENT_SECRET'] = 'abcdefg';
      process.env['TENANT_ID'] = 'bbbb';

      sinon.stub(webreq, 'post').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithServicePrincipal({ type: 'keyvault' })
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle authentication with a Service Principal, parameters set', () => {

      sinon.stub(webreq, 'post').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithServicePrincipal('aaaa', 'abcdefg', 'bbbb')
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle authentication with a Service Principal, parameters set (options.resource included)', () => {

      sinon.stub(webreq, 'post').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithServicePrincipal('aaaa', 'abcdefg', 'bbbb', { resource: 'https://vault.azure.net' })
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle authentication with a Service Principal, parameters set (options.type included)', () => {

      sinon.stub(webreq, 'post').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithServicePrincipal('aaaa', 'abcdefg', 'bbbb', { type: 'keyvault' })
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should throw if the request does not return statusCode 200', () => {

      sinon.stub(webreq, 'post').resolves({ statusCode: 401, body: { error_description: 'Failure.'}});

      return AZAuthentication.authenticateWithServicePrincipal('aaaa', 'abcdefg', 'bbbb')
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('Failure.');
        })
    });

    it('should throw if neither enivonment variables are set, or parameters are procided', () => {

      sinon.stub(webreq, 'post').rejects(new Error());

      return AZAuthentication.authenticateWithServicePrincipal()
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('CLIENT_ID, CLIENT_SECRET and TENANT_ID must be set or provided.')
        });
    });

    it('should throw if options are used instead of clientId or tenantId', () => {

      sinon.stub(webreq, 'post').rejects(new Error());

      return AZAuthentication.authenticateWithServicePrincipal('aaaa', { type: 'keyvault' }, '2222')
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('Either specify clientId, clientSecret, tentantId and options, or options only.');
        })
    });

    it('should throw if request for authentication failed', () => {

      sinon.stub(webreq, 'post').rejects(new Error('Failed to authenticate.'));

      return AZAuthentication.authenticateWithServicePrincipal('aaaa', 'abcdefg', 'bbbb')
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('Failed to authenticate.');
        });
    });
  });

  describe('authenticateWithMSI()', () => {

    let env;

    beforeEach(() => {
      env = process.env;
      process.env = {};
    });

    afterEach(() => {
      process.env = env;
      webreq.get.restore();
    });

    it('should handle autentication with MSI', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';

      sinon.stub(webreq, 'get').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithMSI()
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle autentication with MSI, with options.resource', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';

      let options = { resource: 'https://vault.azure.net' };

      sinon.stub(webreq, 'get').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithMSI(options)
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle autentication with MSI, with options.type', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';

      let options = { type: 'keyvault' };

      sinon.stub(webreq, 'get').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithMSI(options)
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle user assigned identity with MSI_CLIENT_ID set', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';
      process.env['MSI_CLIENT_ID'] = '12345';

      sinon.stub(webreq, 'get').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithMSI()
        .then(credentials => {
          expect(credentials.access_token).to.equal('abcdef');
        });
    });

    it('should handle user assigned identity with options.clientId', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';

      sinon.stub(webreq, 'get').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithMSI({clientId: '12345'})
      .then(credentials => {
        expect(credentials.access_token).to.equal('abcdef');
      });
    });

    it('should throw if the request does not return statusCode 200', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';

      sinon.stub(webreq, 'get').resolves({ statusCode: 401, body: ''});

      return AZAuthentication.authenticateWithMSI()
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('Could not authenticate with MSI.');
        })
    });

    it('should throw if MSI_ENDPOINT or MSI_SECRET is not set', () => {

      sinon.stub(webreq, 'get').resolves({ statusCode: 200, body: { access_token: 'abcdef' }});

      return AZAuthentication.authenticateWithMSI()
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('MSI_ENDPOINT and MSI_SECRET must be set.')
        });
    });

    it('should throw if request for authentication failed', () => {

      process.env['MSI_ENDPOINT'] = 'localhost:44343';
      process.env['MSI_SECRET'] = 'abcdefg';

      sinon.stub(webreq, 'get').rejects(new Error('Failed to authenticate.'));

      return AZAuthentication.authenticateWithMSI()
        .then(() => { })
        .catch(err => {
          expect(err.message).to.equal('Failed to authenticate.');
        });
    });
  });
});
