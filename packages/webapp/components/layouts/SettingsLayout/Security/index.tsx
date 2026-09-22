import React from 'react';
import type { FormEvent, MutableRefObject, ReactElement } from 'react';
import { providerMap } from '@dailydotdev/shared/src/components/auth/common';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LockIcon, MailIcon } from '@dailydotdev/shared/src/components/icons';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { capitalize } from '@dailydotdev/shared/src/lib/strings';
import { BOOT_LOCAL_KEY } from '@dailydotdev/shared/src/contexts/common';
import { DEFAULT_ERROR } from '@dailydotdev/shared/src/graphql/common';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { useMutation } from '@tanstack/react-query';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import type { ManageSocialProvidersProps } from '../common';
import { AccountSecurityDisplay as Display, AccountTextField } from '../common';
import AccountLoginSection from './AccountLoginSection';

const providers = [providerMap.google, providerMap.github];

export interface ChangePasswordParams {
  password: string;
}

export interface UpdateProvidersParams {
  link?: string;
  unlink?: string;
}

const removeProviderList = [
  {
    ...providerMap.google,
    icon: {
      ...providerMap.google.icon,
      props: {
        ...providerMap.google.icon.props,
        secondary: false,
      },
    },
  },
  providerMap.github,
];

interface AccountSecurityDefaultProps {
  email?: string;
  isEmailSent?: boolean;
  userProviders?: { ok: boolean; result: string[] };
  updatePasswordRef: MutableRefObject<HTMLFormElement | null>;
  onSwitchDisplay: (display: Display) => void;
  onUpdatePassword: (form: ChangePasswordParams) => void;
  onUpdateProviders: (params: UpdateProvidersParams) => void;
}

const unlinkProviderPromptOptions: PromptOptions = {
  title: 'Giriş yöntemi kaldırılsın mı?',
  description: 'Artık bu hesapla giriş yapamayacaksınız',
  okButton: {
    title: 'Kaldır',
    color: ButtonColor.Ketchup,
  },
};
const deleteAccountPromptOptions: PromptOptions = {
  title: 'Hesap silinsin mi?',
  description:
    'Bu işlem hesabınızı ve ilişkili tüm verileri kalıcı olarak silecektir. Bu işlem geri alınamaz.',
  okButton: {
    title: 'Evet, hesabımı sil',
    color: ButtonColor.Ketchup,
  },
};

function AccountSecurityDefault({
  email,
  userProviders,
  updatePasswordRef,
  onSwitchDisplay,
  onUpdatePassword,
  onUpdateProviders,
}: AccountSecurityDefaultProps): ReactElement {
  const { deleteAccount } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { onUpdateSignBack } = useSignBack();
  const hasPassword = userProviders?.result?.includes('password');
  const { showPrompt } = usePrompt();

  const manageSocialProviders = async ({
    type,
    provider,
  }: ManageSocialProvidersProps) => {
    onUpdateProviders({ [type]: provider });
  };
  const unlinkProvider = async (provider: string) => {
    if (
      await showPrompt({
        ...unlinkProviderPromptOptions,
        title: `${capitalize(provider)} kaldırılsın mı?`,
        okButton: {
          title: `Evet, ${capitalize(provider)} kaldır`,
          color: ButtonColor.Ketchup,
        },
      })
    ) {
      manageSocialProviders({ type: 'unlink', provider });
    }
  };
  const { mutate: deleteAccountPrompt, isPending: isDeleting } = useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: async () => {
      if (!deleteAccount) {
        throw new Error('Missing deleteAccount handler');
      }
      if (await showPrompt(deleteAccountPromptOptions)) {
        await deleteAccount();
      }
    },
    onError: () => {
      displayToast(DEFAULT_ERROR);
    },
    onSuccess: async () => {
      await onUpdateSignBack(null, null);
      globalThis?.localStorage.removeItem(BOOT_LOCAL_KEY);
      window.location.replace('/');
    },
  });

  const onChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<{ password: string }>(e.currentTarget);
    onUpdatePassword(form);
  };

  return (
    <AccountPageContainer title="Hesap & Güvenlik">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="E-posta"
        description="Hesabınız için birincil e-posta adresi"
      >
        <Tooltip
          side="bottom"
          visible={!hasPassword}
          content={
            <div className="w-60 py-2 typo-subhead">
              E-postanızı değiştirmek için önce bir şifre belirleyin
            </div>
          }
        >
          <AccountTextField
            fieldType="tertiary"
            value={email}
            label="E-posta"
            inputId="email"
            data-testid="current_email"
            leftIcon={<MailIcon />}
            rightIcon={<LockIcon className="text-text-secondary" />}
            isLocked
          />
        </Tooltip>
        {hasPassword && (
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            className="mt-6 w-fit"
            onClick={() => onSwitchDisplay(Display.ChangeEmail)}
          >
            E-posta değiştir
          </Button>
        )}
      </AccountContentSection>
      <AccountLoginSection
        buttonVariant={ButtonVariant.Primary}
        title="Giriş yöntemleri"
        description="Yedek erişim ve daha kolay giriş için ek hesaplar bağlayın"
        providerActionType="link"
        providerAction={manageSocialProviders}
        providers={providers.filter(
          ({ value }) => !userProviders?.result.includes(value),
        )}
      />
      <AccountLoginSection
        title="Bağlı hesaplar"
        description="Profilinize şu anda bağlı olan hesaplar"
        providerAction={({ provider }) => unlinkProvider(provider)}
        providerActionType="unlink"
        className={{ button: 'hover:bg-accent-ketchup-default' }}
        buttonVariant={ButtonVariant.Secondary}
        providers={removeProviderList.filter(({ value }) =>
          userProviders?.result.includes(value),
        )}
      />
      <AccountContentSection
        title="Şifre"
        description="Hesap şifrenizi belirleyin veya güncelleyin"
      >
        <form
          ref={updatePasswordRef}
          className="flex flex-col"
          onSubmit={onChangePassword}
        >
          <PasswordField
            required
            minLength={6}
            className={{ container: 'mt-6 max-w-sm' }}
            inputId="new_password"
            label="Şifre"
            name="password"
          />
          <Button
            type="submit"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            className="mt-6 w-fit"
          >
            Şifre belirle
          </Button>
        </form>
      </AccountContentSection>
      <AccountContentSection title="🚨 Tehlikeli bölge">
        <AccountDangerZone
          onDelete={() => deleteAccountPrompt()}
          className="mt-6"
          buttonLoading={isDeleting}
        />
      </AccountContentSection>
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
