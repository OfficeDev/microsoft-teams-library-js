param resourceBaseName string
param functionAppSKU string
param aadAppClientId string
param aadAppTenantId string
param aadAppOauthAuthorityHost string
@secure()
param aadAppClientSecret string
param location string = resourceGroup().location
param serverfarmsName string = resourceBaseName
param functionAppName string = resourceBaseName
param staticWebAppName string = resourceBaseName
param staticWebAppSku string
var teamsMobileOrDesktopAppClientId = '<teamsMobileOrDesktopAppClientId>'
var teamsWebAppClientId = '<teamsWebAppClientId>'
var officeWebAppClientId1 = '<officeWebAppClientId1>'
var officeWebAppClientId2 = '<officeWebAppClientId2>'
var outlookDesktopAppClientId = '<outlookDesktopAppClientId>'
var outlookWebAppClientId = '<outlookWebAppClientId>'
var officeUwpPwaClientId = '<officeUwpPwaClientId>'
var outlookOnlineAddInAppClientId = '<outlookOnlineAddInAppClientId>'
var allowedClientApplications = '"${teamsMobileOrDesktopAppClientId}","${teamsWebAppClientId}","${officeWebAppClientId1}","${officeWebAppClientId2}","${outlookDesktopAppClientId}","${outlookWebAppClientId}","${officeUwpPwaClientId}","${outlookOnlineAddInAppClientId}"'

// Azure Static Web Apps that hosts your static web site
resource swa 'Microsoft.Web/staticSites@2022-09-01' = {
  name: staticWebAppName
  // SWA do not need location setting
  location: 'centralus'
  sku: {
    name: staticWebAppSku
    tier: staticWebAppSku
  }
  properties:{}
}

var siteDomain = swa.properties.defaultHostname
var tabEndpoint = 'https://${siteDomain}'
var aadApplicationIdUri = 'api://${siteDomain}/${aadAppClientId}'
var oauthAuthority = uri(aadAppOauthAuthorityHost, aadAppTenantId)

// Compute resources for Azure Functions
resource serverfarms 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: serverfarmsName
  kind: 'functionapp'
  location: location
  sku: {
    name: functionAppSKU // You can follow https://aka.ms/teamsfx-bicep-add-param-tutorial to add functionServerfarmsSku property to provisionParameters to override the default value "Y1".
  }
  properties: {}
}

// Azure Functions that hosts your function code
resource functionApp 'Microsoft.Web/sites@2021-02-01' = {
  name: functionAppName
  kind: 'functionapp'
  location: location
  properties: {
    serverFarmId: serverfarms.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      cors: {
        allowedOrigins: [ tabEndpoint ]
      }
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4' // Use Azure Functions runtime v4
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node' // Set runtime to NodeJS
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1' // Run Azure Functions from a package file
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18' // Set NodeJS version to 18.x
        }
        {
          name: 'M365_CLIENT_ID'
          value: aadAppClientId
        }
        {
          name: 'M365_CLIENT_SECRET'
          value: aadAppClientSecret
        }
        {
          name: 'M365_TENANT_ID'
          value: aadAppTenantId
        }
        {
          name: 'M365_AUTHORITY_HOST'
          value: aadAppOauthAuthorityHost
        }
        {
          name: 'M365_APPLICATION_ID_URI'
          value: aadApplicationIdUri
        }
        {
          name: 'WEBSITE_AUTH_AAD_ACL'
          value: '{"allowed_client_applications": [${allowedClientApplications}]}'
        }
      ]
      ftpsState: 'FtpsOnly'
    }
  }
}
var apiEndpoint = 'https://${functionApp.properties.defaultHostName}'

resource authSettings 'Microsoft.Web/sites/config@2021-02-01' = {
  parent: functionApp
  name: 'authsettings'
  properties: {
    enabled: true
    defaultProvider: 'AzureActiveDirectory'
    clientId: aadAppClientId
    issuer: '${oauthAuthority}/v2.0'
    allowedAudiences: [
      aadAppClientId
      aadApplicationIdUri
    ]
  }
}

// The output will be persisted in .env.{envName}. Visit https://aka.ms/teamsfx-actions/arm-deploy for more details.
output TAB_DOMAIN string = siteDomain
output TAB_ENDPOINT string = 'https://${siteDomain}'
output API_FUNCTION_ENDPOINT string = apiEndpoint
output AZURE_STATIC_WEB_APPS_RESOURCE_ID string = swa.id
output API_FUNCTION_RESOURCE_ID string = functionApp.id
