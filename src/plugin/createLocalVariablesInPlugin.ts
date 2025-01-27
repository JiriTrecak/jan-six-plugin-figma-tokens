import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, shouldCreate = true) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  themeInfo.themes.forEach((theme) => {
    const existingVariableCollections = figma.variables.getLocalVariableCollections();
    const collection = existingVariableCollections.find((vr) => vr.name === (theme.group ?? theme.name));
    if (collection) {
      const mode = collection.modes.find((m) => m.name === theme.name);
      const modeId: string = mode?.modeId ?? (shouldCreate ? createVariableMode(collection, theme.name) : '');
      if (modeId) {
        const allVariableObj = updateVariables({
          collection, mode: modeId, theme, tokens, settings, shouldCreate,
        });
        allVariableCollectionIds[theme.id] = {
          collectionId: collection.id,
          modeId,
          variableIds: allVariableObj.variableIds,
        };
        referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
      }
    } else if (shouldCreate) {
      const newCollection = figma.variables.createVariableCollection(theme.group ?? theme.name);
      newCollection.renameMode(newCollection.modes[0].modeId, theme.name);
      const allVariableObj = updateVariables({
        collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings, shouldCreate,
      });
      allVariableCollectionIds[theme.id] = {
        collectionId: newCollection.id,
        modeId: newCollection.modes[0].modeId,
        variableIds: allVariableObj.variableIds,
      };
      referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
    }
  });
  const figmaVariables = figma.variables.getLocalVariables();
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);
  return allVariableCollectionIds;
}
