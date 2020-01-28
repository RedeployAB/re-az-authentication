export = AZAuthentication;

declare class AZAuthentication {
    constructor(options?: any)

    /**
     * Authenticate with Client ID and Client Secret of a Service Principal.
     * If not parameters are passed environment variables will be checked.
     * @param clientId Client ID of Service Principal. Default: Checks AZURE_CLIENT_ID.
     * @param clientSecret Client Secret of Service Principal. Default: Checks AZURE_CLIENT_SECRET.
     * @param tenantId Tenant ID of Service Principal. Default: Checks AZURE_TENANT_ID.
     * @param options Options object.
     * @param options.resource Specify which Azure Resource to authenticate with.
     * @param options.type Specify which Azure Resource to authenticate with (predefined values).
     * @param options.environment Azure Environment to authenticate with (azure, azureUSGovernment, azureGermany or azureChina).
     */
    static authenticateWithServicePrincipal(
        clientId: string,
        clientSecret: string,
        tenantId: string,
        options?: AZAuthentication.ServicePrincipalOptions
    ): Promise<any>

    /**
     * Authenticates with Managed Identity.
     * Checks for environment variables MSI_ENDPONT and MSI_SECRET.
     * Default behaviour is using system assigned identity, specifying client id in the
     * options or setting environment variable MSI_CLIENT_ID will use user assigned identity.
     * @param options Options object.
     * @param options.clientId Client ID of user assigned identity.
     * @param options.resource Specify which Azure Resource to authenticate with.
     * @param options.type Specify which Azure Resource to authenticate with (predefined values).
     * @param options.environment Azure Environment to authenticate with (azure, azureUSGovernment, azureGermany or azureChina).
     */
    static authenticateWithMSI(options?: AZAuthentication.ManagedIdentityOptions): Promise<any>

}

declare namespace AZAuthentication {
    interface ServicePrincipalOptions {
        /**
         * Specify which Azure Resource to authenticate with.
         */
        resource?: string;
        /**
         * Specify which Azure Resource to authenticate with (predefined values).
         */
        type?: 'default'
            | 'arm'
            | 'rm'
            | 'keyvault'
            | 'vault'
            | 'datalake'
            | 'database'
            | 'azuresql'
            | 'eventhubs'
            | 'servicebus'
            | 'storage';
        /**
         * Specify which Azure Environment to authenticate with.
         */
        environment?: 'azure'
            | 'azureUSGovernment'
            | 'azureGermany'
            | 'azureChina';
    }
    
    interface ManagedIdentityOptions extends ServicePrincipalOptions {
        /**
         * Client ID of user assigned identity.
         */
        clientId: string;
    }
}
