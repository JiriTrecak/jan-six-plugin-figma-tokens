import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Heading from './Heading';
import Button from './Button';
import Modal from './Modal';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import { activeTokenSetSelector, importedTokensSelector } from '@/selectors';
import Stack from './Stack';
import IconButton from './IconButton';
import AddIcon from '@/icons/add.svg';
import TrashIcon from '@/icons/trash.svg';
import { SingleToken } from '@/types/tokens';

function ImportToken({
  name,
  value,
  oldValue,
  description,
  oldDescription,
  updateAction,
  removeToken,
  updateToken,
}: {
  name: string;
  value: string;
  oldValue?: string;
  description?: string;
  oldDescription?: string;
  updateAction: string;
  removeToken: any;
  updateToken: any;
}) {
  return (
    <Stack direction="row" justify="between" css={{ padding: '$2 $4' }}>
      <Stack direction="column" gap={1}>
        <div className="font-semibold text-xs">{name}</div>
        <Stack direction="row" align="center" gap={1}>
          <div className="font-bold text-xxs border border-success-muted bg-success-subtle text-success p-1 rounded break-all">
            {typeof value === 'object' ? JSON.stringify(value) : value}
          </div>
          {oldValue ? (
            <div className="font-bold text-xxs border border-danger-muted bg-danger-subtle text-danger p-1 rounded break-all">
              {typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue}
            </div>
          ) : null}
        </Stack>
        {(description || oldDescription) && (
        <div className="text-xxs">
          {description}
          {' '}
          {oldDescription ? ` (before: ${oldDescription})` : ''}
        </div>
        )}
      </Stack>
      <Stack direction="row" align="center" gap={1}>
        <IconButton tooltip={updateAction} icon={AddIcon} onClick={updateToken} />
        <IconButton tooltip="Ignore" icon={TrashIcon} onClick={removeToken} />
      </Stack>
    </Stack>
  );
}

export default function ImportedTokensDialog() {
  const dispatch = useDispatch<Dispatch>();
  const { editSingleToken, createSingleToken } = useManageTokens();
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const importedTokens = useSelector(importedTokensSelector);
  const [newTokens, setNewTokens] = React.useState(importedTokens.newTokens);
  const [updatedTokens, setUpdatedTokens] = React.useState(importedTokens.updatedTokens);

  const handleSetUpdatedTokens = React.useCallback((tokens: SingleToken[]) => {
    setUpdatedTokens(tokens);
  }, [setUpdatedTokens]);

  const handleSetNewTokens = React.useCallback((tokens: SingleToken[]) => {
    setNewTokens(tokens);
  }, [setNewTokens]);

  const handleCreateNewClick = React.useCallback(() => {
    // Create new tokens according to styles
    // TODO: This should probably be a batch operation
    newTokens.forEach((token) => {
      createSingleToken({
        parent: activeTokenSet,
        name: token.name,
        value: token.value,
        options: {
          type: token.type,
          description: token.description,
        },
        shouldUpdateDocument: false,
      });
    });
    setNewTokens([]);
  }, [newTokens, activeTokenSet, createSingleToken]);

  const handleUpdateClick = React.useCallback(() => {
    // Go through each token that needs to be updated
    // TODO: This should probably be a batch operation
    updatedTokens.forEach((token) => {
      editSingleToken({
        parent: activeTokenSet,
        name: token.name,
        value: token.value,
        options: {
          type: token.type,
          description: token.description,
        },
        shouldUpdateDocument: false,
      });
    });
    setUpdatedTokens([]);
  }, [updatedTokens, editSingleToken, activeTokenSet]);

  const handleImportAllClick = React.useCallback(() => {
    // Perform both actions for all the tokens
    // TODO: This should probably be a batch operation
    handleUpdateClick();
    handleCreateNewClick();
  }, [handleCreateNewClick, handleUpdateClick]);

  const handleCreateSingleClick = (token) => {
    // Create new tokens according to styles
    createSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      options: {
        type: token.type,
        description: token.description,
      },
      shouldUpdateDocument: false,
    });
    setNewTokens(newTokens.filter((t) => t.name !== token.name));
  };

  const handleUpdateSingleClick = React.useCallback((token) => {
    // Go through each token that needs to be updated
    editSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      options: {
        type: token.type,
        description: token.description,
      },
      shouldUpdateDocument: false,
    });
    setUpdatedTokens(updatedTokens.filter((t) => t.name !== token.name));
  }, [updatedTokens, editSingleToken, activeTokenSet]);

  const handleClose = React.useCallback(() => {
    dispatch.tokenState.resetImportedTokens();
  }, [dispatch]);

  React.useEffect(() => {
    setNewTokens(importedTokens.newTokens);
    setUpdatedTokens(importedTokens.updatedTokens);
  }, [importedTokens.newTokens, importedTokens.updatedTokens]);

  if (!newTokens.length && !updatedTokens.length) return null;

  return (
    <Modal
      full
      title="Import Styles"
      large
      showClose
      isOpen={newTokens.length > 0 || updatedTokens.length > 0}
      close={handleClose}
    >
      <Stack direction="column" gap={4}>
        {newTokens.length > 0 && (
        <div>
          <Stack
            direction="row"
            justify="between"
            align="center"
            css={{
              marginBottom: '$4', paddingLeft: '$4', paddingRight: '$4', paddingBottom: '$2',
            }}
          >
            <Heading>New Tokens</Heading>
            <Button variant="secondary" id="button-import-create-all" onClick={handleCreateNewClick}>
              Create all
            </Button>
          </Stack>
          <div className="space-y-2 border-t border-gray-300">
            {newTokens.map((token) => (
              <ImportToken
                key={token.name}
                name={token.name}
                value={token.value}
                description={token.description}
                updateAction="Create"
                removeToken={handleSetNewTokens(newTokens.filter((t) => t.name !== token.name))}
                updateToken={handleCreateSingleClick(token)}
              />
            ))}
          </div>
        </div>
        )}
        {updatedTokens.length > 0 && (
        <div>
          <Stack
            direction="row"
            justify="between"
            align="center"
            css={{
              marginBottom: '$4', paddingLeft: '$4', paddingRight: '$4', paddingBottom: '$2',
            }}
          >
            <Heading>Existing Tokens</Heading>
            <Button variant="secondary" id="button-import-update-all" onClick={handleUpdateClick}>
              Update all
            </Button>
          </Stack>
          <div className="space-y-2 border-t border-gray-300">
            {updatedTokens.map((token) => (
              <ImportToken
                key={token.name}
                name={token.name}
                value={token.value}
                oldValue={token.oldValue}
                description={token.description}
                oldDescription={token.oldDescription}
                updateAction="Update"
                removeToken={handleSetUpdatedTokens(updatedTokens.filter((t) => t.name !== token.name))}
                updateToken={handleUpdateSingleClick(token)}
              />
            ))}
          </div>
        </div>
        )}
        <div className="flex justify-between border-t border-gray-300 p-4 ">
          <Button variant="secondary" id="button-import-close" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" id="button-import-all" onClick={handleImportAllClick}>
            Import all
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
