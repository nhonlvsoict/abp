import {
    eIdentityComponents,
    IdentityEntityActionContributors,
    IdentityUserDto,
} from '@abp/ng.identity';
import { EntityAction, EntityActionList } from '@abp/ng.theme.shared/extensions';
import { TfaExtendedComponent } from './tfa-extended/tfa-extended.component';

const quickViewAction = new EntityAction<IdentityUserDto>({
    text: 'Enable TFA',
    action: data => {
        const component = data.getInjected(TfaExtendedComponent);
        component.openEnableTFAView();
    },
});

export function customModalContributor(actionList: EntityActionList<IdentityUserDto>) {
    actionList.addTail(quickViewAction);
}

export const identityEntityActionContributors: IdentityEntityActionContributors = {
    // enum indicates the page to add contributors to
    [eIdentityComponents.Users]: [
        customModalContributor,
        // You can add more contributors here
    ],
};