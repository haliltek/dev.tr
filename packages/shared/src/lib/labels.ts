export const labels = {
  reporting: {
    reportFeedbackText: '🚨 Bildirdiğiniz için teşekkürler!',
  },
  error: {
    generic: '🚫 Bir şeyler ters gitti, lütfen tekrar deneyin.',
    rateLimit: '⌛️ İstek limiti aşıldı, lütfen daha sonra tekrar deneyin.',
    formInvalid: '🚫 Lütfen kaydetmeden önce vurgulanan alanları düzeltin.',
  },
  squads: {
    forbidden: '🚫 Bu Squad\'a artık erişiminiz yok.',
    invalidInvitation:
      '🚫 Davet bağlantısı artık geçerli değil, daha fazla bilgi için bu daveti paylaşan kişiyle (veya Squad yöneticisiyle) iletişime geçin.',
  },
  search: {
    feedbackText: 'Geri bildiriminiz için teşekkürler!',
    shortDescription:
      'Developer\'lar için yapay zeka destekli arama motoru daily.dev Search\'ü keşfedin. Benzersiz özelliklerini, daily.dev platformuyla entegrasyonunu ve en doğru arama sonuçlarını nasıl alacağınızı öğrenin. Kodlama yolculuğunuzda rehberiniz.',
    rateLimitExceeded: 'İstek limiti aşıldı. Lütfen daha sonra tekrar deneyin.',
    unexpectedError: 'Benim ortamımda çalışıyordu. Lütfen tekrar deneyebilir misiniz?',
    stoppedGenerating: 'Bir hatayla karşılaştık! Sayfayı yenilemeyi deneyebilir misiniz?',
  },
  auth: {
    error: {
      invalidEmailOrPassword: 'Geçersiz e-posta veya şifre',
      generic:
        '❌ Beklenmeyen bir hatayla karşılaştık. Lütfen tekrar deneyin.',
      existingEmail:
        'Bu e-posta farklı bir giriş yöntemiyle ilişkilendirilmiş. Lütfen başka bir sağlayıcı deneyin.',
      githubEmailNotVerified:
        'GitHub e-posta adresiniz doğrulanmamış. Lütfen GitHub üzerinden doğrulayıp tekrar deneyin.',
    },
  },
  referral: {
    generic: {
      inviteText: `Developer haberlerini ve gelişmelerini takip etmek için daily.dev kullanıyorum. Senin de yararlı bulacağını düşünüyorum:`,
    },
  },
  devcard: {
    generic: {
      shareText: `@dailydotdev tarafından oluşturulan #DevCard'ıma göz at!`,
      emailTitle: 'daily.dev üzerindeki Dev Card\'ıma göz atın!',
    },
  },
  feed: {
    prompt: {
      discard: {
        title: 'Değişiklikleri iptal et',
        description: 'Kaydedilmemiş değişiklikleriniz kaybolacak',
        okButton: 'Evet, vazgeç',
      },
      newDiscard: {
        title: 'Feed oluşturmaktan vazgeçilsin mi?',
        description:
          "Feed'inizi özelleştirmeye başladınız. Şimdi iptal ederseniz değişiklikleriniz kaybolacak ve feed oluşturulmayacak. Devam etmek istediğinize emin misiniz?",
        descriptionPlus:
          "Feed'inizde bazı değişiklikler yaptınız. Şimdi iptal ederseniz değişiklikler kaybolacak ve feed silinecektir. Devam etmek istediğinize emin misiniz?",
        okButton: 'Evet, vazgeç',
        cancelButton: 'Düzenlemeye devam et',
      },
      delete: {
        description:
          'Feed\'inizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
        okButton: 'Evet, feed\'i sil',
      },
      editPlusSubscribe: {
        title: 'Değişiklik yapmak için yükseltin',
        description:
          'Şu anda daily.dev\'in ücretsiz sürümündesiniz. Feed ayarlarını değiştirmek için Plus\'a yükseltmeniz gerekir.',
        okButton: 'Plus\'a Yükselt',
        cancelButton: 'Feed\'i sil',
      },
      createGenericFeed: {
        title: 'Genel bir feed oluşturulsun mu?',
        description:
          "Herhangi bir özelleştirme eklemediniz. Sizin için genel bir feed oluşturacağız, devam etmek istiyor musunuz? İsterseniz geri dönüp özelleştirebilir veya daha sonra “Feed ayarları” menüsünden düzenleyebilirsiniz.",
        okButton: 'Feed oluştur',
        cancelButton: 'Düzenlemeye devam et',
      },
    },
    error: {
      feedLimit: {
        api: 'Maksimum feed sayısına ulaştınız.',
        client: 'Çok fazla feed olmadı mı sizce de?',
      },
      feedNameInvalid: {
        api: 'Feed adı özel karakter içermemelidir',
      },
    },
    settings: {
      globalPreferenceNotice: {
        clickbaitShield: 'Clickbait koruması tüm feed\'ler için uygulandı',
        contentLanguage: 'Yeni dil tercihleri tüm feed\'ler için ayarlandı',
        highlightsPlacement:
          'Gündem yerleşim tercihi tüm feed\'lerinize uygulandı',
      },
    },
  },
  integrations: {
    prompt: {
      deleteIntegration: {
        title: 'Entegrasyonu sil',
        description:
          'Bu entegrasyonu silmek istediğinize emin misiniz? Slack çalışma alanınıza olan erişimimiz kaldırılacaktır.',
        okButton: 'Evet, entegrasyonu sil',
      },
      deleteSourceIntegration: {
        title: 'Kaynak entegrasyonunu sil',
        description:
          'Bu entegrasyonu silmek istediğinize emin misiniz? Artık bu kaynaktan güncellemeler almayacaksınız.',
        okButton: 'Evet, entegrasyonu sil',
      },
    },
    success: {
      integrationSaved: 'Entegrasyon başarıyla kaydedildi',
    },
    briefIntro: {
      title: 'Brief + Slack = 🔥',
      description: 'Slack üzerinden anlık bildirimler alın',
    },
  },
  cores: {
    error: {
      transactionProcessing: {
        title: 'İşlem yürütülüyor',
        description:
          'İşleminiz gerçekleştiriliyor, lütfen tamamlanmasını bekleyin. Pencereyi kapatmak isterseniz işlem durumunu Core Wallet cüzdanınızdan takip edebilirsiniz. İşlem tamamlandığında bir e-posta da alacaksınız.',
      },
    },
  },
  analytics: {
    boost: {
      activeTitle: 'Boost devam ediyor',
      completedTitle: 'Boost tamamlandı',
      activeDescription: `Postunuz hedefleme motorumuza göre etkileşim olasılığı en yüksek olan developer'lara öne çıkarılıyor. En kritik yerlerde görünmesini sağlıyoruz.`,
      completedDescription: `Postunuzun boost süreci tamamlandı ve doğru developer'ların önüne ulaştı. İlgi devam etsin isterseniz istediğiniz zaman tekrar boost uygulayabilirsiniz.`,
    },
  },
  generatingUsername: 'Harika kullanıcı adınız oluşturuluyor...',
  form: {
    required: 'Bu alan zorunludur',
    discard: {
      title: 'Değişiklikleri iptal et?',
      description: 'Kaydedilmemiş değişiklikleriniz kaybolacak',
      okButton: 'Değişiklikleri kaydet',
      cancelButton: 'Vazgeç',
    },
  },
  opportunity: {
    companyInfoEditNotice: 'Şirket ayrıntılarını güncellemek için yukarıdaki "Düzenle" butonuna tıklayın',
    requiredMissingNotice: {
      title: 'Neredeyse bitti!',
      description: 'Lütfen tüm zorunlu alanların geçerli olduğundan emin olun.',
      okButton: 'Kapat',
    },
    approveNotice: {
      title: 'İlanı Yayınlamaya Hazır mısınız?',
      description:
        'Onaylandıktan sonra bu ilanı adaylarla eşleştirmeye başlayacağız ve eşleşmeler hazır olduğunda Slack üzerinden sizi bilgilendireceğiz.',
      okButton: 'Onayla & Yayınla',
      cancelButton: 'Düzenlemeye dön',
    },
    contentFields: {
      placeholders: {
        overview: 'Pozisyon hakkında bilgi verin',
        responsibilities: 'Temel sorumlulukları listeleyin',
        requirements: 'Gereksinimleri belirtin',
        whatYoullDo: 'Adayın neler yapacağını açıklayın',
        interviewProcess: 'Mülakat sürecini açıklayın',
        generic: 'Daha fazla bilgi verin',
      },
    },
    assignSeat: {
      title: 'Ek lisanslar eklendi',
      description: 'Yeni lisansınızı bu ilana atamak istiyor musunuz?',
      okButton: 'Devam Et',
      cancelButton: 'Daha Sonra',
    },
  },
  postCreation: {
    warnings: {
      spammyPosts:
        'Alakasız veya spam postlar işaretlenebilir ve post paylaşım hakkınızı kaybetmenize yol açabilir.',
    },
  },
  profile: {
    sources: {
      heading: {
        empty: 'Önerilen Squad\'lar',
        activeIn: 'Aktif olunan Squad\'lar',
      },
      viewAll: 'Tüm Squad\'ları Keşfet',
    },
  },
};
