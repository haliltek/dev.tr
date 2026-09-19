import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import ControlledTextField from '@dailydotdev/shared/src/components/fields/ControlledTextField';
import ControlledTextarea from '@dailydotdev/shared/src/components/fields/ControlledTextarea';
import {
  AtIcon,
  UserIcon,
  TerminalIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FormProvider } from 'react-hook-form';
import classed from '@dailydotdev/shared/src/lib/classed';
import ExperienceSelect from '@dailydotdev/shared/src/components/profile/ExperienceSelect';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import ControlledMarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput/ControlledMarkdownInput';
import ProfileLocation from '@dailydotdev/shared/src/components/profile/ProfileLocation';
import ControlledAvatarUpload from '@dailydotdev/shared/src/components/profile/ControlledAvatarUpload';
import ControlledCoverUpload from '@dailydotdev/shared/src/components/profile/ControlledCoverUpload';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useUserInfoForm from '@dailydotdev/shared/src/hooks/useUserInfoForm';
import ControlledSwitch from '@dailydotdev/shared/src/components/fields/ControlledSwitch';
import { SocialLinksInput } from '@dailydotdev/shared/src/components/profile/SocialLinksInput';
import { AccountPageContainer } from '../AccountPageContainer';

const Section = classed('section', 'flex flex-col gap-7');

const ProfileIndex = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const { methods, save, isLoading } = useUserInfoForm();

  const handleSubmit = methods.handleSubmit(() => save());
  return (
    <FormProvider {...methods}>
      <form className="flex flex-1" onSubmit={handleSubmit}>
        <AccountPageContainer
          title="Profil"
          actions={
            <Button
              type="button"
              className="ml-auto"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={isLoading}
              loading={isLoading}
              onClick={handleSubmit}
            >
              Kaydet
            </Button>
          }
        >
          <div className="flex flex-col gap-6">
            <div className="relative mb-10">
              <ControlledCoverUpload
                name="coverUpload"
                currentImageName="cover"
                fileSizeLimitMB={1}
              />
              <div className="absolute bottom-0 left-6 translate-y-1/2">
                <ControlledAvatarUpload
                  name="upload"
                  currentImageName="image"
                  fileSizeLimitMB={1}
                />
              </div>
            </div>

            <Section className="mt-6">
              <ControlledTextField
                name="name"
                label="İsim Soyisim"
                leftIcon={<UserIcon />}
              />
              <ControlledTextField
                name="username"
                label="Kullanıcı Adı"
                leftIcon={<AtIcon />}
              />
              <ControlledTextarea name="bio" label="Unvan / Başlık" />
              <ExperienceSelect
                icon={<TerminalIcon />}
                name="experienceLevel"
                placeholder="Deneyim Seviyesi"
              />
              <ControlledSwitch
                name="hideExperience"
                label="İş geçmişini gizle"
                description="İş deneyiminiz ve eğitiminiz herkese açık profilinizde görünmez"
              />
            </Section>
            <HorizontalSeparator />
            <Section>
              <ProfileLocation
                locationName="externalLocationId"
                defaultValue={user?.location}
              />
            </Section>
            <HorizontalSeparator />
            <Section>
              <div>
                <Typography type={TypographyType.Body} bold>
                  Hakkında
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Geçmişinizi, ne üzerinde çalıştığınızı veya neler
                  öğrendiğinizi paylaşın. Markdown desteklenir.
                </Typography>
              </div>
              <ControlledMarkdownInput
                name="readme"
                textareaProps={{ rows: 10 }}
              />
            </Section>
            <HorizontalSeparator />
            <Section>
              <SocialLinksInput
                name="socialLinks"
                label="Bağlantılar"
                hint="Herhangi bir URL yapıştırın, platformu otomatik olarak tespit edelim"
              />
            </Section>
          </div>
        </AccountPageContainer>
      </form>
    </FormProvider>
  );
};
export default ProfileIndex;
