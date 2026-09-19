import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { PublicProfile } from '../../../../lib/user';
import { MAX_STACK_ITEMS } from '../../../../graphql/user/userStack';
import { useUserStack } from '../../hooks/useUserStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { PlusIcon, ShareIcon } from '../../../../components/icons';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { apiUrl } from '../../../../lib/config';
import { UserStackSection } from './UserStackSection';
import { UserStackModal } from './UserStackModal';
import type {
  UserStack,
  AddUserStackInput,
} from '../../../../graphql/user/userStack';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import {
  buildSectionsState,
  getVisibleSections,
  getReorderPayload,
  moveStackItem,
} from './dnd';
import { UserStackItem } from './UserStackItem';

interface ProfileUserStackProps {
  user: PublicProfile;
}

export function ProfileUserStack({
  user,
}: ProfileUserStackProps): ReactElement | null {
  const { stackItems, isOwner, canAddMore, add, update, remove, reorder } =
    useUserStack(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserStack | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, UserStack[]>>(() =>
    buildSectionsState(stackItems),
  );
  const sectionsRef = useRef(sections);

  const resetSections = useCallback(
    (items: UserStack[]) => {
      const nextSections = buildSectionsState(items);
      sectionsRef.current = nextSections;
      setSections(nextSections);
    },
    [setSections],
  );

  useEffect(() => {
    resetSections(stackItems);
  }, [resetSections, stackItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAdd = useCallback(
    async (input: AddUserStackInput) => {
      try {
        await add(input);
        displayToast('Stack\'inize eklendi');
      } catch (error) {
        displayToast('Öğe eklenemedi');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleEdit = useCallback((item: UserStack) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (input: AddUserStackInput) => {
      if (!editingItem) {
        return;
      }
      try {
        await update({
          id: editingItem.id,
          input: {
            section: input.section,
            title: input.title,
            startedAt: input.startedAt || null,
          },
        });
        displayToast('Stack öğesi güncellendi');
      } catch (error) {
        displayToast('Öğe güncellenemedi');
        throw error;
      }
    },
    [editingItem, update, displayToast],
  );

  const handleDelete = useCallback(
    async (item: UserStack) => {
      const displayTitle = item.title ?? item.tool.title;
      const confirmed = await showPrompt({
        title: 'Stack\'ten kaldırılsın mı?',
        description: `"${displayTitle}" öğesini stack'inizden kaldırmak istediğinize emin misiniz?`,
        okButton: { title: 'Kaldır', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(item.id);
        displayToast('Stack\'inizden kaldırıldı');
      } catch (error) {
        displayToast('Öğe kaldırılamadı');
      }
    },
    [remove, displayToast, showPrompt],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    if (!canAddMore) {
      displayToast(`En fazla ${MAX_STACK_ITEMS} stack öğesine izin veriliyor`);
      return;
    }
    logEvent({
      event_name: LogEvent.StartAddUserStack,
    });
    setIsModalOpen(true);
  }, [canAddMore, displayToast, logEvent]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItemId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setSections((currentSections) => {
      const nextSections = moveStackItem({
        activeId: String(active.id),
        overId: String(over.id),
        sections: currentSections,
      });
      sectionsRef.current = nextSections;

      return nextSections;
    });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveItemId(null);

      if (!event.over) {
        resetSections(stackItems);
        return;
      }

      const nextItems = getReorderPayload(sectionsRef.current);
      const previousSections = buildSectionsState(stackItems);
      const previousItems = getReorderPayload(previousSections);
      const hasChanges =
        JSON.stringify(nextItems) !== JSON.stringify(previousItems);

      if (!hasChanges) {
        return;
      }

      try {
        await reorder(nextItems);
      } catch (error) {
        resetSections(stackItems);
        displayToast('Stack öğeleri yeniden sıralanamadı');
      }
    },
    [displayToast, reorder, resetSections, stackItems],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItemId(null);
    resetSections(stackItems);
  }, [resetSections, stackItems]);

  const activeItem =
    activeItemId && stackItems.find((item) => item.id === activeItemId);

  const hasItems = stackItems.length > 0;

  const [, onShareStack] = useShareOrCopyLink({
    link: `${apiUrl}/og/stack/${user.id}.png`,
    text: 'daily.dev üzerindeki developer stack\'ime göz at!',
    logObject: (provider) => ({
      event_name: LogEvent.ShareUserStack,
      target_id: user.id,
      extra: JSON.stringify({ provider }),
    }),
  });
  const visibleSections = getVisibleSections(sections);

  if (!hasItems && !isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Stack & Araçlar
        </Typography>
        <div className="flex items-center gap-1">
          {isOwner && hasItems && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ShareIcon />}
              onClick={() => onShareStack()}
            >
              Paylaş
            </Button>
          )}
          {isOwner && canAddMore && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Ekle
            </Button>
          )}
        </div>
      </div>

      {hasItems ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-col gap-4">
            {visibleSections.map((section) => (
              <UserStackSection
                key={section}
                section={section}
                items={sections[section] ?? []}
                isOwner={isOwner}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeItem ? (
              <div className="opacity-90 w-fit max-w-full">
                <UserStackItem item={activeItem} isOwner={false} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Stack ve araçlarınızı toplulukla paylaşın
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              İlk öğenizi ekleyin
            </Button>
          </div>
        )
      )}

      {isModalOpen && (
        <UserStackModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={editingItem ? handleUpdate : handleAdd}
          existingItem={editingItem || undefined}
        />
      )}
    </div>
  );
}
