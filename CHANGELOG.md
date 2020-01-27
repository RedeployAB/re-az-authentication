# Changelog

## v0.3.0

### Updates

* Object instantation, `new AZAuthentication()` supports global cloud environments, through the option `environment`.
  * Azure (default, `azure`).
  * Azure US Government (`azureUSGovernment`).
  * Azure German Cloud (`azureGermany`).
  * Azure China (`azureChina`).
* `authenticateWithServicePrincipal()` supports option `environment`. See list above.
* `authenticateWithMSI()` supports option `environment`. See list above.

### Breaking changes

* Updated usage of environment variables:
  * `CLIENT_ID` to `AZURE_CLIENT_ID`.
  * `CLIENT_SECRET` to `AZURE_CLIENT_SECRET`.
  * `TENANT_ID` to `AZURE_TENANT_ID`.

## v0.2.2

* Updated dev dependencies.
* Updated to `webreq@0.6.0`.

## v0.2.1

* Added TypeScript definition file.

## v0.2.0

* Added support for user assigned identities when using `authenticateWithMSI()`.
* Updated dependency `webreq` from `v0.2.0` to `v0.4.0`.

## No version change

* Updated dev dependencies.