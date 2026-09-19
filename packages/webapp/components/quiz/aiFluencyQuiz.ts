export const aiFluencyTierOrder = [
  'casualUser',
  'promptDeveloper',
  'agenticDeveloper',
  'aiEngineer',
  'aiSystemArchitect',
  'aiPlatformDeveloper',
  'aiPioneer',
] as const;

export type AiFluencyTierKey = (typeof aiFluencyTierOrder)[number];

export interface AiFluencyTier {
  key: AiFluencyTierKey;
  label: string;
  summary: string;
}

export interface AiFluencyQuestionOption {
  id: string;
  label: string;
  tier: AiFluencyTierKey;
}

export interface AiFluencyQuestion {
  id: string;
  prompt: string;
  options: AiFluencyQuestionOption[];
}

const getSeedFromString = (value: string): number => {
  return value.split('').reduce((hash, char, index) => {
    return (hash * 31 + char.charCodeAt(0) * (index + 1)) % 2147483647;
  }, 1);
};

const createSeededRandom = (seed: number): (() => number) => {
  let currentSeed = seed % 2147483647;
  if (currentSeed <= 0) {
    currentSeed += 2147483646;
  }

  return () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return (currentSeed - 1) / 2147483646;
  };
};

const tierScoreMap: Record<AiFluencyTierKey, number> = {
  casualUser: 1,
  promptDeveloper: 2,
  agenticDeveloper: 3,
  aiEngineer: 4,
  aiSystemArchitect: 5,
  aiPlatformDeveloper: 6,
  aiPioneer: 7,
};

export const aiFluencyTiers: AiFluencyTier[] = [
  {
    key: 'casualUser',
    label: 'Casual User',
    summary: 'Hızlı cevaplar ve hafif tek seferlik yardım için AI kullanır.',
  },
  {
    key: 'promptDeveloper',
    label: 'Prompt Developer',
    summary: 'Daha iyi çıktılar üretmek için yapılandırılmış promptlar ve iterasyon kullanır.',
  },
  {
    key: 'agenticDeveloper',
    label: 'Agentic Developer',
    summary: 'Çok adımlı AI iş akışları ve bağlam duyarlı promptlama ile çalışır.',
  },
  {
    key: 'aiEngineer',
    label: 'AI Engineer',
    summary:
      'Değerlendirme, güvenlik ve güvenilirlik odaklı prodüksiyon düzeyinde AI özellikleri geliştirir.',
  },
  {
    key: 'aiSystemArchitect',
    label: 'AI System Architect',
    summary:
      'Orkestrasyon, yönetişim ve işletim standartları ile uçtan uca AI sistemleri tasarlar.',
  },
  {
    key: 'aiPlatformDeveloper',
    label: 'AI Platform Developer',
    summary:
      'Ekipler için yeniden kullanılabilir AI platformları, dahili araçlar ve ölçeklenebilir eğitimler oluşturur.',
  },
  {
    key: 'aiPioneer',
    label: 'AI Pioneer',
    summary:
      'Yeni AI pratiklerini şekillendirir, inovasyonu yönlendirir ve kurumsal stratejiyi etkiler.',
  },
];

const aiFluencyTierByKey = aiFluencyTiers.reduce((acc, tier) => {
  acc[tier.key] = tier;
  return acc;
}, {} as Record<AiFluencyTierKey, AiFluencyTier>);

export const aiFluencyQuestions: AiFluencyQuestion[] = [
  {
    id: 'task-start',
    prompt: 'AI ile yeni bir göreve nasıl başlarsınız?',
    options: [
      {
        id: 'task-start-quick-answer',
        label:
          'Yeni bir sohbet açar, hızlıca bir soru sorar ve işe yarayan kısımları kopyalarım.',
        tier: 'casualUser',
      },
      {
        id: 'task-start-prompt-template',
        label:
          'Kütüphanemden veya kayıtlı projelerimden bir prompt seçer, çıktı oturana kadar iterate ederim.',
        tier: 'promptDeveloper',
      },
      {
        id: 'task-start-plan-workflow',
        label: "AI'dan görevleri adımlara bölmesini ve bağlamı korumasını isterim.",
        tier: 'agenticDeveloper',
      },
      {
        id: 'task-start-evals',
        label:
          'Geliştirmeye başlamadan önce başarı kriterlerini, uç durumları ve tekrarlanabilir testleri tanımlarım.',
        tier: 'aiEngineer',
      },
      {
        id: 'task-start-systems',
        label:
          'Başlamadan önce görevin mevcut AI mimarimizle nasıl uyum sağladığını değerlendiririm.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'context-management',
    prompt: 'Uzun AI oturumlarında bağlamı (context) nasıl yönetirsiniz?',
    options: [
      {
        id: 'context-management-none',
        label: 'Genellikle her seferinde sıfırdan yeni bir sohbet başlatırım.',
        tier: 'casualUser',
      },
      {
        id: 'context-management-manual',
        label:
          "Gerektiğinde önceki sohbetlerden veya dokümanlardan ilgili bağlamı prompt'uma kopyalayıp yapıştırırım.",
        tier: 'promptDeveloper',
      },
      {
        id: 'context-management-structured',
        label:
          'Daha uzun iş akışlarında bağlamı güncel tutmak için araçlar ve teknikler kullanırım.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'context-management-state',
        label: 'Güvenilir çok adımlı çalışmalar için bellek/durum (state) desenleri kullanırım.',
        tier: 'aiEngineer',
      },
      {
        id: 'context-management-platform',
        label: 'Ekipler ve araçlar için paylaşılan bağlam standartları tanımlarım.',
        tier: 'aiPlatformDeveloper',
      },
    ],
  },
  {
    id: 'quality-check',
    prompt: 'AI çıktı kalitesini nasıl kontrol edersiniz?',
    options: [
      {
        id: 'quality-check-skim',
        label:
          'Çıktıya göz gezdiririm ve makul görünüyorsa kullanırım. Ayrıntıları nadiren doğrularım.',
        tier: 'casualUser',
      },
      {
        id: 'quality-check-manual',
        label: 'Belirgin durumları manuel olarak test eder ve sorun çıktıkça düzeltirim.',
        tier: 'promptDeveloper',
      },
      {
        id: 'quality-check-checklist',
        label: 'Doğruluk, güvenlik ve stil için bir kontrol listesi (checklist) kullanırım.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'quality-check-evals',
        label:
          'Tekrarlanabilir kalite kontrolleri çalıştırır ve zaman içindeki başarı/başarısızlık eğilimlerini takip ederim.',
        tier: 'aiEngineer',
      },
      {
        id: 'quality-check-org-standard',
        label:
          "AI kalitesi için kurum genelinde değerlendirme standartları, guardrail'lar ve SLI göstergeleri tanımlarım.",
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'tooling',
    prompt: 'AI araçları kurulumunuzu en iyi hangisi tanımlar?',
    options: [
      {
        id: 'tooling-single-chat',
        label:
          'İhtiyaç duydukça ChatGPT veya Copilot gibi tek bir sohbet aracı kullanırım.',
        tier: 'casualUser',
      },
      {
        id: 'tooling-multi-tool',
        label:
          'Aralarında esnek bir iş akışı bulunan birkaç araç (sohbet, kod asistanı, belki yerel bir model) kullanırım.',
        tier: 'promptDeveloper',
      },
      {
        id: 'tooling-agent-workflow',
        label: 'Net rollere sahip bir araç zinciri (araştırma, taslak, inceleme).',
        tier: 'agenticDeveloper',
      },
      {
        id: 'tooling-service-integration',
        label: 'İzleme ve fallback mekanizmalarına sahip entegre AI servisleri.',
        tier: 'aiEngineer',
      },
      {
        id: 'tooling-platform',
        label: 'Kurum genelinde ekiplerin yeniden kullanabileceği dahili bir platform.',
        tier: 'aiPlatformDeveloper',
      },
    ],
  },
  {
    id: 'automation',
    prompt: 'AI iş akışlarını ne kadar otomatikleştiriyorsunuz?',
    options: [
      {
        id: 'automation-none',
        label:
          "Neredeyse hiç. Her seferinde promptları elle yazarım, hiçbir şeyi yeniden kullanmam veya script'e dökmem.",
        tier: 'casualUser',
      },
      {
        id: 'automation-basic',
        label:
          'En sık tekrarladığım promptları otomatik olarak işleyen basit scriptlerim veya kayıtlı şablonlarım var.',
        tier: 'promptDeveloper',
      },
      {
        id: 'automation-agent',
        label: "Kontrol noktaları ve onay mekanizmaları olan yarı otomatik agent'lar.",
        tier: 'agenticDeveloper',
      },
      {
        id: 'automation-production',
        label:
          'İzleme ve değişiklikleri geri alma yeteneğine sahip güvenilir prodüksiyon otomasyonu.',
        tier: 'aiEngineer',
      },
      {
        id: 'automation-program',
        label: 'Birden fazla ekip tarafından kullanılan kurumsal otomasyon standartları.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'collaboration',
    prompt: 'AI görevlerinde ekip arkadaşlarınızla nasıl çalışırsınız?',
    options: [
      {
        id: 'collaboration-solo',
        label:
          "AI'ı kendi başıma kullanırım. Yararlı bir şey bulursam laf arasında bahsedebilirim.",
        tier: 'casualUser',
      },
      {
        id: 'collaboration-share-prompts',
        label: 'Yararlı promptları ve örnekleri dokümanlarda veya sohbette paylaşırım.',
        tier: 'promptDeveloper',
      },
      {
        id: 'collaboration-repeatable-playbooks',
        label: "Tekrarlanabilir AI iş akışları için paylaşılan playbook'lar yürütürüm.",
        tier: 'agenticDeveloper',
      },
      {
        id: 'collaboration-review-process',
        label:
          'AI çıktı kalitesini ve prompt mantığını kapsayan kod incelemelerine liderlik ederim.',
        tier: 'aiEngineer',
      },
      {
        id: 'collaboration-enable-org',
        label: 'Ekipler genelinde AI adaptasyonu için eğitim ve standartlara öncülük ederim.',
        tier: 'aiPlatformDeveloper',
      },
    ],
  },
  {
    id: 'risk-and-safety',
    prompt: 'AI riskini ve güvenliğini nasıl ele alırsınız?',
    options: [
      {
        id: 'risk-and-safety-reactive',
        label:
          'AI riskini önceden düşünmem. Yalnızca ortaya çıktıklarında sorunları düzeltirim.',
        tier: 'casualUser',
      },
      {
        id: 'risk-and-safety-basic-checks',
        label:
          'Hassas çıktıları iki kez kontrol eder ve kullanmadan önce bariz halüsinasyonlara dikkat ederim.',
        tier: 'promptDeveloper',
      },
      {
        id: 'risk-and-safety-scenarios',
        label: 'Yaygın hata senaryolarını test eder ve çözümleri dokümante ederim.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'risk-and-safety-production',
        label:
          'Prodüksiyon özelliklerine güvenlik kontrolleri ve içerik filtreleri dahil ederim.',
        tier: 'aiEngineer',
      },
      {
        id: 'risk-and-safety-guardrails',
        label:
          'Güvenlik kuralları kurar, hatalar için stres testleri yapar ve eskalasyon yolları belirlerim.',
        tier: 'aiSystemArchitect',
      },
      {
        id: 'risk-and-safety-frontier',
        label:
          'Yeni model davranışları için gelişmiş güvenlik pratiklerinin tanımlanmasına yardımcı olurum.',
        tier: 'aiPioneer',
      },
    ],
  },
  {
    id: 'measurement',
    prompt: 'AI kullanımının yarattığı etkiyi nasıl ölçüyorsunuz?',
    options: [
      {
        id: 'measurement-feel',
        label: 'İçgüdülerime ve kişisel üretkenlik kazanımlarıma güvenirim.',
        tier: 'casualUser',
      },
      {
        id: 'measurement-basic-metrics',
        label: 'Birkaç basit metriği manuel olarak takip ederim (zaman tasarrufu, çıktı adedi).',
        tier: 'promptDeveloper',
      },
      {
        id: 'measurement-team-metrics',
        label: 'Belirli iş akışlarına bağlı ekip çıktılarını takip ederim.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'measurement-product-metrics',
        label:
          'Model kalitesini panolarda ürün ve iş metrikleriyle birlikte izlerim.',
        tier: 'aiEngineer',
      },
      {
        id: 'measurement-strategy',
        label:
          'Ekipler ve ürünler genelinde AI programları için başarı metrikleri tanımlarım.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'ai-mistakes',
    prompt: 'AI hata yaptığında durumu nasıl yönetirsiniz?',
    options: [
      {
        id: 'ai-mistakes-trust',
        label:
          'Genellikle çıktıya güvenirim ve bir hata fark edersem düzeltirim.',
        tier: 'casualUser',
      },
      {
        id: 'ai-mistakes-rephrase',
        label:
          "Önemli çıktıları iki kez kontrol eder ve sorunluysa prompt'umu yeniden ifade ederim.",
        tier: 'promptDeveloper',
      },
      {
        id: 'ai-mistakes-model-selection',
        label:
          'İş için doğru modeli seçer ve hataları azaltmak için promptları yapılandırırım.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'ai-mistakes-automated-checks',
        label:
          'Kötü çıktıların kullanıcılara ulaşmasını engelleyen otomatik kontroller oluştururum.',
        tier: 'aiEngineer',
      },
      {
        id: 'ai-mistakes-containment',
        label:
          'AI hatalarının izole edildiği ve ardışık krizlere yol açmadığı sistemler tasarlarım.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'future-readiness',
    prompt: 'AI hızla değişirken güncel kalmayı nasıl başarıyorsunuz?',
    options: [
      {
        id: 'future-readiness-occasional',
        label:
          'Yeni AI araçlarını sosyal medyadan veya iş arkadaşlarımdan duyarım, ancak değişiklikleri aktif olarak takip etmem.',
        tier: 'casualUser',
      },
      {
        id: 'future-readiness-routine',
        label:
          'Yeni modeller ve prompt teknikleri popülerlik kazandığında dener, işe yarayanları benimserim.',
        tier: 'promptDeveloper',
      },
      {
        id: 'future-readiness-deliberate',
        label: 'Planlı deneyler yürütür ve öğrendiklerimi kaydederim.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'future-readiness-roadmap',
        label: 'Gelişmiş yetenekleri güvenle benimsemek için bir yol haritası yürütürüm.',
        tier: 'aiSystemArchitect',
      },
      {
        id: 'future-readiness-shape-market',
        label:
          'Prototip geliştirir, yayınlar yapar ve başkalarının yeni AI kalıplarını nasıl benimsediğini şekillendiririm.',
        tier: 'aiPioneer',
      },
    ],
  },
];

export const getShuffledAiFluencyQuestionOptions = (
  question: AiFluencyQuestion,
): AiFluencyQuestionOption[] => {
  const random = createSeededRandom(getSeedFromString(question.id));
  const options = [...question.options];

  for (let index = options.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [options[index], options[nextIndex]] = [options[nextIndex], options[index]];
  }

  return options;
};

const optionTierById = aiFluencyQuestions.reduce((acc, question) => {
  question.options.forEach((option) => {
    acc[option.id] = option.tier;
  });
  return acc;
}, {} as Record<string, AiFluencyTierKey>);

export const aiFluencyTipsByTier: Record<AiFluencyTierKey, string[]> = {
  casualUser: [
    'Basit bir prompt şablonu kullanın: bağlam, görev, kısıtlamalar, beklenen çıktı.',
    'Bir cevap seçmeden önce en az iki farklı prompt varyasyonunu karşılaştırın.',
    'Uygulamadan önce çıktıyı doğruluk ve uç durumlar açısından gözden geçirin.',
  ],
  promptDeveloper: [
    'Karmaşık görevleri açık kontrol noktaları olan çok adımlı promptlara bölün.',
    "Yeniden kullanılabilir promptları ve örnekleri paylaşılan bir playbook'ta saklayın.",
    'En sık kullandığınız iş akışları için kaliteyi ve kazanılan zamanı ölçmeye başlayın.',
  ],
  agenticDeveloper: [
    'Yaygın senaryolarda çıktıları doğrulamak için hafif kalite kontrolleri ekleyin.',
    "Güvenlik, gizlilik ve halüsinasyon riskleri için guardrail'lar uygulayın.",
    'Tekrarlayan AI iş akışlarını net insan onay noktaları ile otomatikleştirin.',
  ],
  aiEngineer: [
    'Değerlendirme veri kümelerini ve geçme/kalma eşiklerini standartlaştırın.',
    'Prodüksiyon kullanımını izleme ve hata sınıflandırmasıyla donatın.',
    'Güvenilirlik için model seçim kriterlerini ve fallback davranışlarını dokümante edin.',
  ],
  aiSystemArchitect: [
    'Ekipler ve ürünler arasında paylaşılan AI mimari standartlarını belirleyin.',
    'Risk incelemeleri ve politika denetimi için yönetişim süreçleri oluşturun.',
    'Ekiplerin onaylanmış AI kalıplarından self-servis yararlanabilmesi için yetenek haritaları oluşturun.',
  ],
  aiPlatformDeveloper: [
    'Güvenli denemeleri hızlandırmak için yeniden kullanılabilir platform bileşenlerine yatırım yapın.',
    'Gelişmiş AI iş akışları için şirket içi geliştirici eğitimlerini genişletin.',
    'Gelişen modelleri ve teknikleri stratejik hedeflere göre benchmark edin.',
  ],
  aiPioneer: [
    'Referans mimarileri ve edinilen dersleri yayınlamaya devam edin.',
    'AI liderlerine mentorluk yapın ve karar alma çerçevelerini kurum genelinde ölçeklendirin.',
    'Güvenlik ve yönetişim titizliğini korurken öncü deneylerin sınırlarını zorlayın.',
  ],
};

export const getAiFluencyTierByKey = (
  key?: string,
): AiFluencyTier | undefined => {
  if (!key || !(key in aiFluencyTierByKey)) {
    return undefined;
  }

  return aiFluencyTierByKey[key as AiFluencyTierKey];
};

export const getAiFluencyTierFromAnswers = (
  answers: Record<string, string>,
): AiFluencyTier => {
  const selectedQuestionScores = aiFluencyQuestions
    .map((question) => {
      const tier = optionTierById[answers[question.id]];

      if (!tier) {
        return null;
      }

      const optionScores = question.options.map(
        ({ tier: optionTier }) => tierScoreMap[optionTier],
      );

      return {
        selectedScore: tierScoreMap[tier],
        minScore: Math.min(...optionScores),
        maxScore: Math.max(...optionScores),
      };
    })
    .filter(
      (
        score,
      ): score is {
        selectedScore: number;
        minScore: number;
        maxScore: number;
      } => Boolean(score),
    );

  if (!selectedQuestionScores.length) {
    return aiFluencyTiers[0];
  }

  const totalScore = selectedQuestionScores.reduce(
    (sum, { selectedScore }) => sum + selectedScore,
    0,
  );
  const minPossibleScore = selectedQuestionScores.reduce(
    (sum, { minScore }) => sum + minScore,
    0,
  );
  const maxPossibleScore = selectedQuestionScores.reduce(
    (sum, { maxScore }) => sum + maxScore,
    0,
  );
  const normalizedScore =
    maxPossibleScore === minPossibleScore
      ? 1
      : ((totalScore - minPossibleScore) /
          (maxPossibleScore - minPossibleScore)) *
          6 +
        1;
  const roundedScore = Math.round(normalizedScore);
  const tierIndex = Math.min(
    aiFluencyTiers.length - 1,
    Math.max(0, roundedScore - 1),
  );

  return aiFluencyTiers[tierIndex];
};

export const getAiFluencyNextTier = (
  currentTierKey: AiFluencyTierKey,
): AiFluencyTier | null => {
  const currentIndex = aiFluencyTierOrder.indexOf(currentTierKey);
  const nextKey = aiFluencyTierOrder[currentIndex + 1];

  if (!nextKey) {
    return null;
  }

  return aiFluencyTierByKey[nextKey];
};
