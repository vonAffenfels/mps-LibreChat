import { useMemo } from 'react';
import { OGDialog, DialogTemplate } from '@librechat/client';
import MarkdownLite from '~/components/Chat/Messages/Content/MarkdownLite';
import { useLocalize } from '~/hooks';

const StaticContentModal = ({
  open,
  onOpenChange,
  title,
  modalContent,
  ariaLabel,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  modalContent?: string | string[];
  ariaLabel?: string;
}) => {
  const localize = useLocalize();

  const content = useMemo(() => {
    if (typeof modalContent === 'string') {
      return modalContent;
    }

    if (Array.isArray(modalContent)) {
      return modalContent.join('\n');
    }

    return '';
  }, [modalContent]);

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title={title}
        className="w-11/12 max-w-3xl sm:w-3/4 md:w-1/2 lg:w-2/5"
        showCloseButton={true}
        showCancelButton={false}
        main={
          <section
            tabIndex={0}
            className="max-h-[60vh] overflow-y-auto p-4"
            aria-label={ariaLabel || title}
          >
            <div className="prose dark:prose-invert w-full max-w-none !text-text-primary">
              {content !== '' ? (
                <MarkdownLite content={content} />
              ) : (
                <p>{localize('com_ui_no_content')}</p>
              )}
            </div>
          </section>
        }
        buttons={<></>}
      />
    </OGDialog>
  );
};

export default StaticContentModal;
