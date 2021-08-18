import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'UnirealchainProject1',
    logoUrl: '',
  },
  oAuthConfig: {
    // issuer: 'https://localhost:44305',
    // redirectUri: baseUrl,
    // clientId: 'MyProjectName_App',
    // responseType: 'code',
    // scope: 'offline_access openid profile role email phone MyProjectName',
    // requireHttps: true
    issuer: 'https://localhost:44305',
    clientId: 'MyProjectName_App',
    dummyClientSecret: '1q2w3e*',
    scope: 'offline_access MyProjectName',
  },
  apis: {
    default: {
      url: 'https://localhost:44305',
      rootNamespace: 'MyCompanyName.MyProjectName',
    },
  },
} as Environment;
