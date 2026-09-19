import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import {
  Divider,
  FlexCol,
  FlexRow,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import {
  recruiterSpamCampaign,
  recruiterSpamCampaignSEO,
} from '@dailydotdev/shared/src/lib/image';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  CopyIcon,
  CoreIcon,
  MailIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { defaultSeo } from '../next-seo';
import { getLayout } from '../components/layouts/NoSidebarLayout';
import ProtectedPage from '../components/ProtectedPage';

const seo: NextSeoProps = {
  title: "daily.dev | Recruiter Spam Mesajlarını Cores'a Dönüştür",
  openGraph: { images: [{ url: recruiterSpamCampaignSEO }] },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const formLink = 'https://it057218.typeform.com/to/PoQ6GV0d';

const HeaderSection = (): ReactElement => {
  return (
    <FlexCol className="items-center gap-8">
      <Typography center type={TypographyType.Mega1} bold>
        Recruiter Spam
        <br /> Mesajlarını Cores'a Dönüştür 💰
      </Typography>

      <Image
        className="mb-5 rounded-16"
        src={recruiterSpamCampaign}
        alt="Recruiter Spam Mesajlarını Cores'a Dönüştür"
      />

      <FlexCol className="items-center gap-6 text-center">
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
        >
          Her gün sizin gibi geliştiriciler; alakasız, ısrarcı veya yapay zeka tarafından üretilmiş soğuk recruiter mesajlarının bombardımanına tutuluyor.
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
        >
          <strong>daily.dev</strong> olarak bu durumu tersine çevirmek istiyoruz. Aldığınız her recruiter mesajı için artık{' '}
          <strong>1.000 Cores</strong> kazanabilirsiniz. Bunları özellikleri açmak, içeriklerinizi öne çıkarmak veya topluluğa katkınız için ödüllendirilmek amacıyla kullanabilirsiniz.
        </Typography>
      </FlexCol>
    </FlexCol>
  );
};

const howItWorksItems = [
  {
    icon: MailIcon,
    number: 1,
    title: "LinkedIn DM'lerinizi kontrol edin",
    description:
      'Bir recruiter\'dan soğuk mesaj mı aldınız? Harika — bu sizin biletiniz.',
  },
  {
    icon: CopyIcon,
    number: 2,
    title: 'Şablonumuzla yanıt verin',
    description:
      'Aşağıdaki şablonu kopyalayıp yapıştırın (veya kendinizinkini yazıp https://recruiter.daily.dev bağlantısını ekleyin)',
  },
  {
    icon: UploadIcon,
    number: 3,
    title: 'Kanıtı gönderin',
    description:
      'Ekran görüntüsünü ve recruiter profil bağlantısını bu form aracılığıyla yükleyin:',
    extra: true,
  },
  {
    icon: CoreIcon,
    number: 4,
    title: 'Ücretsiz Cores kazanın',
    description: (
      <>
        Doğrulandıktan sonra Cores doğrudan hesabınıza aktarılacaktır.
        <br /> Başvuruları her 14 günde bir inceliyoruz.
      </>
    ),
  },
];
const HowItWorksSection = (): ReactElement => {
  const { user } = useAuthContext();

  const [, copyText] = useCopyText(
    "I'm currently not open to opportunities. You might find the right candidate on https://recruiter.daily.dev. It's worth checking out!",
  );

  return (
    <FlexCol className="gap-7">
      <Typography type={TypographyType.LargeTitle} center bold>
        Nasıl çalışır 💡
      </Typography>
      <FlexCol className="mb-12 gap-6">
        {howItWorksItems.map(
          ({ icon: Icon, number, title, description, extra }) => (
            <div
              className="shadow-sm relative flex flex-col gap-6 overflow-hidden rounded-16 border border-border-subtlest-primary bg-background-subtle p-6"
              key={number}
            >
              <FlexRow className="items-center gap-4">
                <Typography type={TypographyType.Title3} bold>
                  {number}
                </Typography>
                <Icon size={IconSize.Large} />
                <FlexCol className="flex-1">
                  <Typography type={TypographyType.Body} bold className="mb-2">
                    {title}
                  </Typography>
                  <Typography
                    type={TypographyType.Body}
                    color={TypographyColor.Tertiary}
                    className="flex flex-wrap"
                  >
                    {description}{' '}
                    {!!extra && (
                      <a
                        href={`${formLink}#user_id=${user?.id}`}
                        className="ml-1 text-text-link underline"
                        target="_blank"
                        rel={anchorDefaultRel}
                      >
                        buradan
                      </a>
                    )}
                  </Typography>
                </FlexCol>
              </FlexRow>
            </div>
          ),
        )}
      </FlexCol>
      <div className="shadow-sm md:p-8 flex flex-col gap-6 rounded-16 border border-border-subtlest-primary bg-background-subtle p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <FlexCol className="flex-1 gap-4">
            <Typography type={TypographyType.Title3} bold>
              Hazır Yanıt Şablonu
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Kopyalamak ve LinkedIn yanıtınıza yapıştırmak için tıklayın
            </Typography>
          </FlexCol>
          <Button
            icon={<CopyIcon />}
            variant={ButtonVariant.Tertiary}
            className="ml-auto"
            onClick={() => copyText()}
          />
        </div>
        <div className="break-words rounded-14 border border-border-subtlest-primary p-4 font-mono">
          I&apos;m currently not open to opportunities. You might find the right
          candidate on https://recruiter.daily.dev. It&apos;s worth checking
          out!
        </div>
      </div>

      <FlexRow className="items-center gap-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mx-auto"
        >
          Basit. Gerçek. Geliştirici odaklı.
        </Typography>
      </FlexRow>
    </FlexCol>
  );
};

const finePrint = [
  {
    description:
      'Kaliteyi sağlamak için tüm başvurular manuel olarak incelenir (her 14 günde bir).',
  },
  {
    description: 'Yalnızca LinkedIn üzerinden gelen soğuk recruiter mesajları kabul edilir.',
  },
  {
    description: 'Mesajlar son 3 ay içinde alınmış olmalıdır.',
  },
  {
    description:
      'Şimdilik yalnızca ABD ve Avrupa merkezli geliştiricilerin başvurularını kabul edebiliyoruz.',
  },
  {
    description:
      'Birden fazla başvuru yapılabilir (en fazla 10) ve kullanıcı başına en fazla 10.000 Cores kazanılabilir.',
  },
  {
    description:
      'Yüklediğiniz ekran görüntüsü mesajı ve recruiter kimliğini net bir şekilde göstermelidir.',
  },
  {
    description:
      'Sistemi kötüye kullanmaya veya sahte içerik göndermeye çalışan geliştiriciler gelecekteki kampanyalardan men edilecektir.',
  },
];
const FinePrintSection = (): ReactElement => (
  <FlexCol className="gap-7">
    <Typography type={TypographyType.LargeTitle} center bold>
      Önemli detaylar 🛡️
    </Typography>
    <div className="gap-6">
      <ul className="list ml-6 list-disc space-y-2">
        {finePrint.map(({ description }) => (
          <li key={description}>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
            >
              {description}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  </FlexCol>
);

const GetStartedSection = (): ReactElement => {
  const { user } = useAuthContext();

  return (
    <FlexCol className="items-center gap-6">
      <Typography center type={TypographyType.Title3} bold>
        Recruiter spam mesajlarını silmeyi bırakın. Cores kazanmaya başlayın!
      </Typography>
      <Button
        tag="a"
        href={`${formLink}#user_id=${user?.id}`}
        target="_blank"
        variant={ButtonVariant.Primary}
      >
        Cores'larımı İstiyorum
      </Button>
    </FlexCol>
  );
};

const RecruiterSpamPage = (): ReactElement => {
  return (
    <ProtectedPage>
      <div className="relative mx-4 mb-20 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <FlexCol className="gap-10 tablet:mx-4 laptop:mx-0">
          <HeaderSection />
          <Divider />
          <HowItWorksSection />
          <Divider />
          <FinePrintSection />
          <Divider />
          <GetStartedSection />
        </FlexCol>
      </div>
    </ProtectedPage>
  );
};

RecruiterSpamPage.getLayout = getLayout;
RecruiterSpamPage.layoutProps = { screenCentered: true, seo };

export default RecruiterSpamPage;
