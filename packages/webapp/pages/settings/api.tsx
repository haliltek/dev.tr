import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  usePlusSubscription,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import {
  usePersonalAccessTokens,
  useCreatePersonalAccessToken,
  useRevokePersonalAccessToken,
} from '@dailydotdev/shared/src/hooks/api/usePersonalAccessTokens';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  PlusIcon,
  CopyIcon,
  TrashIcon,
  LockIcon,
  DocsIcon,
  ArrowIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { ModalHeader } from '@dailydotdev/shared/src/components/modals/common/ModalHeader';
import { ModalBody } from '@dailydotdev/shared/src/components/modals/common/ModalBody';
import { ModalFooter } from '@dailydotdev/shared/src/components/modals/common/ModalFooter';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('API Access'),
  ...noindexSeoProps,
};

const OPENAPI_URL = 'https://api.daily.dev/public/v1/docs/json';
const DAILY_DEV_OPENCLAW_INSTRUCTION =
  'Install daily-dev from clawhub and explain my new superpowers';
const DAILY_DEV_AGENTIC_OPENCLAW_INSTRUCTION =
  'Install daily-dev-agentic from clawhub and start getting smarter';
const CLAUDE_INSTALL_COMMAND = [
  `claude plugin marketplace add https://github.com/dailydotdev/daily.git`,
  `claude plugin install daily.dev@daily.dev`,
  `claude "/daily.dev setup"`,
];

const DAILY_DEV_ASK_OPENCLAW_INSTRUCTION =
  'Install daily-dev-ask from clawhub and ask about my topic';
const DAILY_DEV_ASK_CLAUDE_INSTALL_COMMAND = [
  `claude plugin marketplace add https://github.com/dailydotdev/daily.git`,
  `claude plugin install daily.dev@daily.dev`,
  `claude "/daily-dev-ask your question here"`,
];

const CURSOR_REPO_URL = 'https://github.com/dailydotdev/daily.git';
const CODEX_INSTALL_COMMAND = `$skill-installer install the daily.dev skill from ${CURSOR_REPO_URL}`;
const CODEX_ASK_INSTALL_COMMAND = `$skill-installer install the daily-dev-ask skill from ${CURSOR_REPO_URL}`;

interface SkillInstallMethod {
  tool: 'OpenClaw' | 'Claude Code' | 'Codex' | 'Cursor';
  description: string;
  code?: string;
  multilineCode?: boolean;
  copyValue?: string;
  copySuccessMessage?: string;
  steps?: string[];
  note?: string;
}

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  methods: SkillInstallMethod[];
}

const SKILLS: SkillDefinition[] = [
  {
    id: 'daily-dev',
    name: 'daily-dev',
    description:
      'Overcome LLM knowledge cutoffs with real-time developer content.',
    methods: [
      {
        tool: 'OpenClaw',
        description: 'Copy this instruction to your agent to get started:',
        code: DAILY_DEV_OPENCLAW_INSTRUCTION,
        copyValue: DAILY_DEV_OPENCLAW_INSTRUCTION,
        copySuccessMessage: 'Instruction copied to clipboard',
      },
      {
        tool: 'Claude Code',
        description:
          'Add daily.dev to Claude Code as a plugin with these commands:',
        code: CLAUDE_INSTALL_COMMAND.join('\n'),
        multilineCode: true,
        copyValue: CLAUDE_INSTALL_COMMAND.join(' && '),
        copySuccessMessage: 'Command copied to clipboard',
        note: 'After setup, use /daily.dev to interact with your feed and features.',
      },
      {
        tool: 'Codex',
        description: 'Install the daily.dev skill in Codex with this command:',
        code: CODEX_INSTALL_COMMAND,
        copyValue: CODEX_INSTALL_COMMAND,
        copySuccessMessage: 'Command copied to clipboard',
        note: 'Restart Codex after installation, then use $daily.dev.',
      },
      {
        tool: 'Cursor',
        description: 'Add daily.dev as a remote skill in Cursor:',
        steps: [
          'Open Cursor Settings -> Rules (Cmd+Shift+J on Mac, Ctrl+Shift+J on Windows/Linux)',
          'Click "Add Rule" -> "Remote Rule (Github)"',
          'Enter the repository URL below',
        ],
        code: CURSOR_REPO_URL,
        copyValue: CURSOR_REPO_URL,
        copySuccessMessage: 'URL copied to clipboard',
        note: 'Use /daily.dev in Agent chat to interact with your feed.',
      },
    ],
  },
  {
    id: 'daily-dev-ask',
    name: 'daily-dev-ask',
    description:
      "Your agent's WebSearch for development — like a senior dev's reading list. Search community-vetted articles ranked by upvotes, grounded in real sources.",
    methods: [
      {
        tool: 'OpenClaw',
        description: 'Copy this instruction to your agent to get started:',
        code: DAILY_DEV_ASK_OPENCLAW_INSTRUCTION,
        copyValue: DAILY_DEV_ASK_OPENCLAW_INSTRUCTION,
        copySuccessMessage: 'Instruction copied to clipboard',
      },
      {
        tool: 'Claude Code',
        description:
          'Add daily.dev to Claude Code as a plugin, then use /daily-dev-ask:',
        code: DAILY_DEV_ASK_CLAUDE_INSTALL_COMMAND.join('\n'),
        multilineCode: true,
        copyValue: DAILY_DEV_ASK_CLAUDE_INSTALL_COMMAND.join(' && '),
        copySuccessMessage: 'Command copied to clipboard',
        note: 'After setup, use /daily-dev-ask to search and answer questions from daily.dev articles.',
      },
      {
        tool: 'Codex',
        description:
          'Install the daily-dev-ask skill in Codex with this command:',
        code: CODEX_ASK_INSTALL_COMMAND,
        copyValue: CODEX_ASK_INSTALL_COMMAND,
        copySuccessMessage: 'Command copied to clipboard',
        note: 'Restart Codex after installation, then use $daily-dev-ask.',
      },
      {
        tool: 'Cursor',
      },
      {
        tool: 'Cursor',
        description: 'Add the daily-dev-ask skill in Cursor:',
        steps: [
          'Open Cursor Settings > Features > Rules for AI',
          'Add the daily-dev-ask skill configuration',
          `Reference the repository: ${CURSOR_REPO_URL}`,
        ],
        copyValue: CURSOR_REPO_URL,
        copySuccessMessage: 'Repository URL copied to clipboard',
      },
    ],
  },
  {
    id: 'daily-dev-agentic',
    name: 'daily-dev-agentic',
    description:
      'Autonomous agent integration that lets AI agents interact with your daily.dev feed.',
    methods: [
      {
        tool: 'OpenClaw',
        description: 'Install the daily-dev-agentic skill in OpenClaw:',
        code: DAILY_DEV_AGENTIC_OPENCLAW_INSTRUCTION,
        copyValue: DAILY_DEV_AGENTIC_OPENCLAW_INSTRUCTION,
        copySuccessMessage: 'Instruction copied to clipboard',
      },
    ],
  },
];

const lowercaseRelativeDate = (dateStr: string): string => {
  const relativeDates = ['Now', 'Today', 'Yesterday'];
  return relativeDates.includes(dateStr) ? dateStr.toLowerCase() : dateStr;
};

const ExpirationOptions = [
  { value: '', label: 'Süresiz (Asla bitmez)' },
  { value: '30', label: '30 gün' },
  { value: '90', label: '90 gün' },
  { value: '365', label: '1 yıl' },
];

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const CreateTokenModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateTokenModalProps): ReactElement => {
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState('');
  const { mutateAsync: createToken, isPending } =
    useCreatePersonalAccessToken();
  const { displayToast } = useToastNotification();

  const handleCreate = async () => {
    if (!name.trim()) {
      displayToast('Lütfen bir token adı girin');
      return;
    }

    try {
      const result = await createToken({
        name: name.trim(),
        expiresInDays: expiration ? parseInt(expiration, 10) : null,
      });
      onSuccess(result.token);
      setName('');
      setExpiration('');
    } catch {
      displayToast('Token oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} size={ModalSize.Small}>
      <ModalHeader title="API Token'ı Oluştur" />
      <ModalBody className="flex flex-col gap-4">
        <TextField
          label="Token adı"
          inputId="token-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: Yapay Zeka Ajanım"
          maxLength={50}
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Son kullanma süresi
          </Typography>
          <Radio
            name="expiration"
            value={expiration}
            onChange={setExpiration}
            options={ExpirationOptions}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          onClick={onClose}
        >
          İptal
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={handleCreate}
          loading={isPending}
          disabled={!name.trim()}
        >
          Token oluştur
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface TokenCreatedModalProps {
  isOpen: boolean;
  token: string;
  onClose: () => void;
}

const TokenCreatedModal = ({
  isOpen,
  token,
  onClose,
}: TokenCreatedModalProps): ReactElement => {
  const { displayToast } = useToastNotification();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      displayToast('Token panoya kopyalandı');
    } catch {
      displayToast('Token kopyalanamadı');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} size={ModalSize.Small}>
      <ModalHeader title="Token oluşturuldu" />
      <ModalBody className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-12 bg-status-warning p-3">
          <LockIcon size={IconSize.Small} className="shrink-0" />
          <Typography type={TypographyType.Callout}>
            Bu token yalnızca bir kez gösterilecektir.
            <br />
            Hemen şimdi kopyalayın!
          </Typography>
        </div>
        <div className="flex items-center gap-2 rounded-12 bg-surface-float p-3">
          <code className="flex-1 break-all text-text-primary">{token}</code>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<CopyIcon />}
            onClick={handleCopy}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={onClose}
        >
          Token&apos;ımı kopyaladım
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface TokenListItemProps {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  onRevoke: (id: string) => void;
}

const TokenListItem = ({
  id,
  name,
  tokenPrefix,
  createdAt,
  lastUsedAt,
  onRevoke,
}: TokenListItemProps): ReactElement => {
  return (
    <div className="flex items-start justify-between gap-2 rounded-12 border border-border-subtlest-tertiary p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography type={TypographyType.Body} bold className="truncate">
          {name}
        </Typography>
        <div className="flex flex-wrap gap-x-1 text-text-tertiary typo-footnote">
          <span>{tokenPrefix}...</span>
          <span>&#x2022;</span>
          <span>
            Oluşturulma:{' '}
            {lowercaseRelativeDate(
              formatDate({ value: createdAt, type: TimeFormatType.Post }),
            )}
          </span>
          {lastUsedAt && (
            <>
              <span>&#x2022;</span>
              <span>
                Son kullanım:{' '}
                {lowercaseRelativeDate(
                  formatDate({
                    value: lastUsedAt,
                    type: TimeFormatType.Post,
                  }),
                )}
              </span>
            </>
          )}
        </div>
      </div>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<TrashIcon />}
        onClick={() => onRevoke(id)}
        className="shrink-0"
      />
    </div>
  );
};

interface CopyableCodeBlockProps {
  text: string;
  onCopy: () => Promise<void>;
  multiline?: boolean;
}

const CopyableCodeBlock = ({
  text,
  onCopy,
  multiline,
}: CopyableCodeBlockProps): ReactElement => {
  return (
    <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
      <code
        className={`min-w-0 flex-1 break-words text-text-tertiary ${
          multiline ? 'whitespace-pre-wrap' : ''
        }`}
      >
        {text}
      </code>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<CopyIcon />}
        onClick={onCopy}
        className="shrink-0"
      />
    </div>
  );
};

const ApiAccessPage = (): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { data: tokens, isLoading } = usePersonalAccessTokens();
  const { mutateAsync: revokeToken } = useRevokePersonalAccessToken();
  const { displayToast } = useToastNotification();
  const isMobile = useViewSize(ViewSize.MobileL);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>(
    {},
  );
  let tokenEmptyStateText = 'Henüz token yok. Başlamak için bir tane oluşturun.';

  if (!isPlus) {
    tokenEmptyStateText =
      'API token\'ları oluşturmak ve daily.dev API\'si ile kimlik doğrulamak için Plus\'a yükseltin.';
  }

  const handleCopy = async (value: string, successMessage = 'Kopyalandı') => {
    try {
      await navigator.clipboard.writeText(value);
      displayToast(successMessage);
    } catch {
      displayToast('Kopyalanamadı');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeToken(id);
      displayToast('Token başarıyla iptal edildi');
    } catch {
      displayToast('Token iptal edilemedi');
    }
  };

  const toggleSkill = (skillId: string) => {
    setExpandedSkills((current) => ({
      ...current,
      [skillId]: !current[skillId],
    }));
  };

  return (
    <AccountPageContainer
      title="API Erişimi"
      actions={
        isPlus ? (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={() => setShowCreateModal(true)}
          >
            {isMobile ? undefined : 'Token oluştur'}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Kişisel Erişim Token'ları (Personal Access Tokens)
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            daily.dev API'si ile kimlik doğrulaması yapmak için token'ları
            kullanın. Token'lar kişiselleştirilmiş feed'inize ve gönderilerinize
            salt okunur erişim sağlar.
          </Typography>
        </div>

        {isLoading && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Token'lar yükleniyor...
          </Typography>
        )}

        {!isLoading && tokens && tokens.length > 0 && (
          <div className="flex flex-col gap-3">
            {tokens.map((token) => (
              <TokenListItem
                key={token.id}
                id={token.id}
                name={token.name}
                tokenPrefix={token.tokenPrefix}
                createdAt={new Date(token.createdAt)}
                lastUsedAt={
                  token.lastUsedAt ? new Date(token.lastUsedAt) : null
                }
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}

        {!isLoading && (!tokens || tokens.length === 0) && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {tokenEmptyStateText}
            </Typography>
            {isPlus ? (
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                onClick={() => setShowCreateModal(true)}
              >
                İlk token'ınızı oluşturun
              </Button>
            ) : (
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                tag="a"
                href="/plus"
              >
                Plus'a Yükselt
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Beceriler & Entegrasyonlar (Skills)
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Aşağıdaki entegrasyonları kullanarak bir veya daha fazla daily.dev
            becerisini kurun.
          </Typography>
          <div className="flex flex-col gap-4">
            {SKILLS.map((skill) => {
              const supportedTools = Array.from(
                new Set(skill.methods.map((method) => method.tool)),
              );
              const isExpanded = !!expandedSkills[skill.id];

              return (
                <div
                  key={skill.id}
                  className="flex flex-col rounded-12 border border-border-subtlest-tertiary p-4"
                >
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`skill-${skill.id}`}
                    className="flex w-full items-start justify-between gap-3 rounded-8 py-1 text-left"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        <Typography type={TypographyType.Callout} bold>
                          {skill.name}
                        </Typography>
                        <div className="flex flex-wrap items-center gap-2">
                          {supportedTools.map((tool) => (
                            <span
                              key={`${skill.id}-${tool}`}
                              className="rounded-16 bg-surface-float px-2 py-0.5 text-text-tertiary typo-footnote"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Typography
                        type={TypographyType.Callout}
                        color={TypographyColor.Tertiary}
                        className="whitespace-normal break-words"
                      >
                        {skill.description}
                      </Typography>
                    </div>
                    <ArrowIcon
                      className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${
                        isExpanded ? 'rotate-180' : 'rotate-90'
                      }`}
                    />
                  </button>

                  <div
                    id={`skill-${skill.id}`}
                    className={`flex flex-col overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? 'mt-4 max-h-[1200px] gap-4 opacity-100'
                        : 'mt-0 max-h-0 gap-0 opacity-0'
                    }`}
                  >
                    {skill.methods.map((method) => (
                      <div
                        key={`${skill.id}-${method.tool}`}
                        className="flex flex-col gap-2"
                      >
                        <Typography type={TypographyType.Callout} bold>
                          {method.tool}
                        </Typography>
                        <Typography
                          type={TypographyType.Callout}
                          color={TypographyColor.Tertiary}
                          className="whitespace-normal break-words"
                        >
                          {method.description}
                        </Typography>
                        {method.steps && (
                          <ol className="list-inside list-decimal text-text-tertiary typo-callout">
                            {method.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        )}
                        {method.code && method.copyValue && (
                          <CopyableCodeBlock
                            text={method.code}
                            multiline={method.multilineCode}
                            onCopy={() =>
                              handleCopy(
                                method.copyValue!,
                                method.copySuccessMessage,
                              )
                            }
                          />
                        )}
                        {method.note && (
                          <Typography
                            type={TypographyType.Callout}
                            color={TypographyColor.Tertiary}
                            className="whitespace-normal break-all"
                          >
                            {method.note}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Dokümantasyon
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            API'yi nasıl kullanacağınızı öğrenin ve mevcut uç noktaları
            keşfedin.
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<DocsIcon />}
              tag="a"
              href="https://docs.daily.dev/docs/plus/public-api"
              target="_blank"
            >
              API Dokümantasyonu
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<DocsIcon />}
              tag="a"
              href={OPENAPI_URL}
              target="_blank"
            >
              OpenAPI Referansı
            </Button>
          </div>
        </div>
      </div>

      <CreateTokenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(token) => {
          setShowCreateModal(false);
          setCreatedToken(token);
        }}
      />

      <TokenCreatedModal
        isOpen={!!createdToken}
        token={createdToken || ''}
        onClose={() => setCreatedToken(null)}
      />
    </AccountPageContainer>
  );
};

ApiAccessPage.getLayout = getSettingsLayout;
ApiAccessPage.layoutProps = { seo };

export default ApiAccessPage;
