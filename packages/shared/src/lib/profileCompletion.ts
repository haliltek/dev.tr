import type { ProfileCompletion } from './user';
import { webappUrl } from './constants';

export type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
};

export const getCompletionItems = (
  completion: ProfileCompletion,
): CompletionItem[] => {
  return [
    {
      label: 'Profil fotoğrafı',
      completed: completion.hasProfileImage,
      redirectPath: `${webappUrl}settings/profile`,
    },
    {
      label: 'Başlık (Headline)',
      completed: completion.hasHeadline,
      redirectPath: `${webappUrl}settings/profile?field=bio`,
    },
    {
      label: 'Deneyim seviyesi',
      completed: completion.hasExperienceLevel,
      redirectPath: `${webappUrl}settings/profile?field=experienceLevel`,
    },
    {
      label: 'İş deneyimi',
      completed: completion.hasWork,
      redirectPath: `${webappUrl}settings/profile/experience/work`,
    },
    {
      label: 'Eğitim',
      completed: completion.hasEducation,
      redirectPath: `${webappUrl}settings/profile/experience/education`,
    },
  ];
};

export const formatCompletionDescription = (
  incompleteItems: CompletionItem[],
): string => {
  if (incompleteItems.length === 0) {
    return 'Profil tamamlandı!';
  }

  const labels = incompleteItems.map((item) => item.label);
  const formattedList =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} ve ${labels[labels.length - 1]}`;

  return `${formattedList} bilgilerini ekle.`;
};
