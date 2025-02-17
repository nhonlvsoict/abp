import { AuthGuard } from '@abp/ng.core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomLoginComponent } from './components/custom-login/custom-login.component';
import { CustomRegisterComponent } from './components/custom-register/custom-register.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: "login"
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: CustomLoginComponent,
    // canActivate: [PermissionGuard],
    // data: {
    //     requiredPolicy: 'MyProjectName offline_access', // policy key for your component
    // },
    
  },
  {
    path: 'register',
    pathMatch: 'full',
    component: CustomRegisterComponent 
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.AccountModule.forLazy()),
  },
  {
    path: 'identity',
    loadChildren: () => import('./identity-extended/identity-extended.module').then(m => m.IdentityExtendedModule),
  },
  {
    path: 'tenant-management',
    loadChildren: () =>
      import('@abp/ng.tenant-management').then(m => m.TenantManagementModule.forLazy()),
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
