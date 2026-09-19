import React from 'react';
import type { ReactElement } from 'react';

import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import DevCardPlaceholder from '@dailydotdev/shared/src/components/DevCardPlaceholder';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { DevCardMutation } from '../../../../../graphql/devcard';
import { GENERATE_DEVCARD_MUTATION } from '../../../../../graphql/devcard';

type Step1Props = {
  onGenerateImage(url: string): void;
};

export const DevCardStep1 = ({ onGenerateImage }: Step1Props): ReactElement => {
  const { user } = useAuthContext();
  const { mutateAsync: onGenerate, isPending: isLoading } = useMutation({
    mutationFn: () =>
      gqlClient.request<DevCardMutation>(GENERATE_DEVCARD_MUTATION),
    onSuccess: (data) => {
      const url = data?.devCard?.imageUrl;

      if (data?.devCard?.imageUrl) {
        onGenerateImage(url);
      }
    },
  });

  return (
    <div className="flex flex-col items-center">
      <DevCardPlaceholder profileImage={user!.image} />
      <Typography bold tag={TypographyTag.H1} type={TypographyType.Title1}>
        DevCard'ını oluştur
      </Typography>
      <Typography
        className="mt-4 max-w-[23.5rem] text-center"
        type={TypographyType.Subhead}
        color={TypographyColor.Secondary}
      >
        Gelişiminizi paylaşmak harika bir histir ve bunu bir DevCard ile yapmak
        çıtayı bir üst seviyeye taşır. Okuma alışkanlıklarınız, en çok
        ilgilendiğiniz konular ve platformdaki etkinliğinizi sergilemek için bir
        DevCard oluşturun.
      </Typography>
      <div className="mt-10 h-12">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={() => onGenerate()}
          loading={isLoading}
        >
          Şimdi oluştur
        </Button>
      </div>
    </div>
  );
};
