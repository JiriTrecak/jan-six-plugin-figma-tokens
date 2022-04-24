import { getAliasValue } from '../getAliasValue';
import { SingleToken } from '@/types/tokens';

describe('deepLinkingAlias', () => {
  const inputTokens = [
    {
      name: 'font-size.tokenvalue',
      input: '$typography.tokensize.fontSize',
      value: '4px',
    },
    {
      name: 'font-size.pixelsize',
      input: '$typography.pixelsize.fontSize',
      value: '5px',
    },
    {
      name: 'font-size.numbersize',
      input: '$typography.numbersize.fontSize',
      value: 10,
    },
    {
      name: 'font-weight.bold',
      input: '$typography.tokensize.fontWeight',
      value: 'bold',
    }
  ]

  const allTokens = [
    {
      name: 'typography.tokensize',
      rawValue: {
        fontSize: '$2',
        fontWeight: 'bold'
      },
      value: '4px'
    },
    {
      name: 'typography.pixelsize',
      rawValue: {
        fontSize: '5px',
        fontWeight: 'bold'
      },
      value: '5px'
    },
    {
      name: 'typography.numbersize',
      rawValue: {
        fontSize: 10,
        fontWeight: 'bold'
      },
      value: 10
    }
  ]

  inputTokens.forEach((token) => {
    it(`alias ${token.name}`, () => {
      // @TODO check this test typing
      expect(getAliasValue({ value: token.input } as SingleToken, allTokens as unknown as SingleToken[])).toEqual(token.value);
    });
  });
});