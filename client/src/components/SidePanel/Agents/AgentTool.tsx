import React, { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useUpdateUserPluginsMutation } from 'librechat-data-provider/react-query';
import {
  OGDialog,
  TrashIcon,
  CircleHelpIcon,
  useToastContext,
  OGDialogTrigger,
  OGDialogTemplate,
} from '@librechat/client';
import type { TPlugin } from 'librechat-data-provider';
import type { AgentForm } from '~/common';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

export default function AgentTool({
  tool,
  regularTools,
}: {
  tool: string;
  regularTools?: TPlugin[];
  agent_id?: string;
}) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const updateUserPlugins = useUpdateUserPluginsMutation();
  const { control, getValues, setValue } = useFormContext<AgentForm>();

  const [isFocused, setIsFocused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Watch tool_kwargs to react to form changes
  const toolKwargs = useWatch({ control, name: 'tool_kwargs' }) || [];

  if (!regularTools) {
    return null;
  }

  const currentTool = regularTools.find((t) => t.pluginKey === tool);

  if (!currentTool) {
    return null;
  }

  const removeTool = (toolId: string) => {
    if (toolId) {
      updateUserPlugins.mutate(
        { pluginKey: toolId, action: 'uninstall', auth: {}, isEntityTool: true },
        {
          onError: (error: unknown) => {
            showToast({ message: `Error while deleting the tool: ${error}`, status: 'error' });
          },
          onSuccess: () => {
            const remainingToolIds = getValues('tools')?.filter((id: string) => id !== toolId);
            setValue('tools', remainingToolIds);
            showToast({ message: 'Tool deleted successfully', status: 'success' });
          },
        },
      );
    }
  };

  // Get current tool_kwargs for image_gen_oai
  const imageGenConfig = toolKwargs.find((kwargs: any) => kwargs?.tool === 'image_gen_oai');
  const [selectedModel, setSelectedModel] = useState<string>(
    imageGenConfig?.model || 'gpt-image-1',
  );

  // Sync selectedModel with tool_kwargs when form is loaded/reset
  useEffect(() => {
    if (tool === 'image_gen_oai') {
      const currentConfig = toolKwargs.find((kwargs: any) => kwargs?.tool === 'image_gen_oai');
      const modelFromKwargs = currentConfig?.model;
      if (modelFromKwargs && modelFromKwargs !== selectedModel) {
        setSelectedModel(modelFromKwargs);
      }
    }
  }, [tool, toolKwargs, selectedModel]);

  // Update tool_kwargs when model changes
  useEffect(() => {
    if (tool === 'image_gen_oai') {
      const currentKwargs = getValues('tool_kwargs') || [];
      const otherKwargs = currentKwargs.filter((kwargs: any) => kwargs?.tool !== 'image_gen_oai');
      const newKwargs = [
        ...otherKwargs,
        {
          tool: 'image_gen_oai',
          model: selectedModel,
        },
      ];
      setValue('tool_kwargs', newKwargs);
    }
  }, [selectedModel, tool, getValues, setValue]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  return (
    <OGDialog>
      <div
        className="group relative flex w-full flex-col gap-2 rounded-lg p-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          // Check if focus is moving to a child element
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
          }
        }}
      >
        <div className="flex w-full items-center gap-1">
          <div className="flex grow items-center">
            {currentTool.icon && (
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                <div
                  className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-center bg-no-repeat dark:bg-white/20"
                  style={{
                    backgroundImage: `url(${currentTool.icon})`,
                    backgroundSize: 'cover',
                  }}
                />
              </div>
            )}
            <div
              className="grow px-2 py-1.5"
              style={{ textOverflow: 'ellipsis', wordBreak: 'break-all', overflow: 'hidden' }}
            >
              {currentTool.name}
            </div>
          </div>

          <OGDialogTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded transition-all duration-200',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                'focus:opacity-100',
                isHovering || isFocused ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-label={`Delete ${currentTool.name}`}
              tabIndex={0}
              onFocus={() => setIsFocused(true)}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </OGDialogTrigger>
        </div>

        {/* Model selection for image_gen_oai */}
        {tool === 'image_gen_oai' && (
          <div className="flex flex-col gap-1 px-2 pb-1">
            <label htmlFor="image-model-select" className="text-xs text-text-secondary">
              {localize('com_ui_model')}
            </label>
            <select
              id="image-model-select"
              value={selectedModel}
              onChange={handleModelChange}
              className="rounded border border-border-light bg-surface-secondary px-2 py-1 text-sm focus:border-ring-primary focus:outline-none focus:ring-2 focus:ring-ring-primary"
            >
              <option value="gpt-image-1">gpt-image-1</option>
              <option value="gpt-image-1-mini">gpt-image-1-mini</option>
            </select>
          </div>
        )}
      </div>
      <OGDialogTemplate
        showCloseButton={false}
        title={localize('com_ui_delete_tool')}
        className="max-w-[450px]"
        main={
          <>
            <div className="flex w-full flex-col items-start gap-2 text-sm text-text-secondary">
              <p>
                {localize('com_ui_delete_tool_confirm')}{' '}
                <strong>&quot;{currentTool.name}&quot;</strong>?
              </p>
              {currentTool.description && (
                <div className="flex items-start gap-2">
                  <CircleHelpIcon className="h-4 w-4 flex-shrink-0 text-text-secondary" />
                  <p className="text-sm">{currentTool.description}</p>
                </div>
              )}
            </div>
          </>
        }
        selection={{
          selectHandler: () => removeTool(tool),
          selectClasses:
            'bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-800 text-white',
          selectText: localize('com_ui_delete'),
        }}
      />
    </OGDialog>
  );
}
