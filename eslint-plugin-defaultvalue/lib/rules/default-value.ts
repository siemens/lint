/**
 * Copyright Siemens 2024.
 * SPDX-License-Identifier: MIT
 */
import {
  DocBlock,
  DocCodeSpan,
  DocEscapedText,
  DocFencedCode,
  DocNode,
  DocNodeKind,
  DocPlainText,
  type ParserContext,
  StringBuilder,
  TextRange,
  TSDocConfiguration,
  TSDocParser
} from '@microsoft/tsdoc';
import type { TSDocConfigFile } from '@microsoft/tsdoc-config';
import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { RuleContext, RuleFix, RuleFixer, SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { ConfigCache } from './ConfigCache.js';
import { TSDocEmitter } from './TSDocEmitter.js';

const getParser = (context: Readonly<RuleContext<any, []>>): TSDocParser => {
  const tsdocConfiguration: TSDocConfiguration = new TSDocConfiguration();

  try {
    const tsdocConfigFile: TSDocConfigFile = ConfigCache.getForSourceFile(context.filename);
    if (!tsdocConfigFile.fileNotFound) {
      if (tsdocConfigFile.hasErrors) {
        context.report({
          loc: { line: 1, column: 1 },
          messageId: 'error-loading-tsdoc-config-file',
          data: {
            details: tsdocConfigFile.getErrorSummary()
          }
        });
      }

      try {
        tsdocConfigFile.configureParser(tsdocConfiguration);
      } catch (e: any) {
        context.report({
          loc: { line: 1, column: 1 },
          messageId: 'error-applying-tsdoc-config',
          data: {
            details: e.message
          }
        });
      }
    }
  } catch (e: any) {
    context.report({
      loc: { line: 1, column: 1 },
      messageId: 'error-loading-tsdoc-config-file',
      data: {
        details: `Unexpected exception: ${e.message}`
      }
    });
  }

  return new TSDocParser(tsdocConfiguration);
};

const extractComment = (
  node: TSESTree.Node,
  sourceCode: SourceCode,
  parser: TSDocParser
):
  | {
      defaultValue?: string;
      commentNode: TSESTree.BlockComment;
      tsDocComment: ParserContext;
      defaultValueTsDocNode?: DocBlock;
    }
  | undefined => {
  const comment = sourceCode
    .getCommentsBefore(node)
    .filter(sComment => sComment.type === 'Block')
    .at(-1);

  if (comment?.range) {
    const textRange: TextRange = TextRange.fromStringRange(
      sourceCode.text,
      comment.range[0],
      comment.range[1]
    );
    const parserContext: ParserContext = parser.parseRange(textRange);
    for (const customBlock of parserContext.docComment.customBlocks) {
      if (customBlock.kind === DocNodeKind.Block) {
        if (customBlock.blockTag.tagName === '@defaultValue') {
          return {
            defaultValue: getValueText(customBlock.content).trim(),
            commentNode: comment,
            tsDocComment: parserContext,
            defaultValueTsDocNode: customBlock
          };
        }
      }
    }
    return { commentNode: comment, tsDocComment: parserContext };
  }
  return undefined;
};

const getValueText = (node: DocNode): string => {
  switch (node.kind) {
    case DocNodeKind.PlainText:
      return (node as DocPlainText).text;
    case DocNodeKind.EscapedText:
      return (node as DocEscapedText).decodedText;
    case DocNodeKind.CodeSpan:
      return `\`${(node as DocCodeSpan).code}\``;
    case DocNodeKind.FencedCode:
      return (node as DocFencedCode).code;
    default:
      return node.getChildNodes().map(getValueText).join('');
  }
};

const angularSignalNames = ['signal', 'input', 'model'];
const extractPropertyInformation = (
  node: TSESTree.PropertyDefinition | TSESTree.MethodDefinition,
  sourceCode: Readonly<SourceCode>
): { defaultValue?: string; propertyName: string } => {
  const name = node.key.type === AST_NODE_TYPES.Identifier ? node.key.name : '*';

  if (node.type === AST_NODE_TYPES.MethodDefinition) {
    // We cannot extract the value here.
    return { propertyName: name };
  }

  const readonly = node.type === AST_NODE_TYPES.PropertyDefinition && node.readonly;

  // Should not be documented as readonly values do not have a default value, but just a "value".
  // But signals should be able to be readonly and still have their default values displayed.
  if (readonly && node.value?.type !== AST_NODE_TYPES.CallExpression) {
    return { propertyName: name };
  }

  switch (node.value?.type) {
    case AST_NODE_TYPES.Literal:
      return {
        defaultValue:
          typeof node.value.value === 'string'
            ? "'" + node.value.value + "'"
            : '' + node.value.value,
        propertyName: name
      };
    case AST_NODE_TYPES.CallExpression:
      return {
        defaultValue: extractCallExpression(node.value, sourceCode, readonly),
        propertyName: name
      };
    case AST_NODE_TYPES.ObjectExpression:
    case AST_NODE_TYPES.ArrayExpression:
    case AST_NODE_TYPES.ArrowFunctionExpression:
    case AST_NODE_TYPES.UnaryExpression:
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return { defaultValue: sourceCode.getText(node.value), propertyName: name };
    default:
      return { propertyName: name };
  }
};

const extractCallExpression = (
  callExpression: TSESTree.CallExpression,
  sourceCode: SourceCode,
  readonly: boolean
): any => {
  switch (callExpression.callee.type) {
    case AST_NODE_TYPES.Identifier:
      if (angularSignalNames.includes(callExpression.callee.name)) {
        const [value] = callExpression.arguments;
        if (value) {
          return sourceCode.getText(value);
        } else {
          return undefined;
        }
      }
      // Should not be documented.
      if (readonly) {
        return undefined;
      }
      return sourceCode.getText(callExpression);
    case AST_NODE_TYPES.MemberExpression:
      if (
        callExpression.callee.object.type === AST_NODE_TYPES.Identifier &&
        angularSignalNames.includes(callExpression.callee.object.name)
      ) {
        // something like input.required().
        // This will never have a defaultValue.
        return undefined;
      }
      // Should not be documented.
      if (readonly) {
        return undefined;
      }
      return sourceCode.getText(callExpression);
    default:
      // Should not be documented.
      if (readonly) {
        return undefined;
      }
      return sourceCode.getText(callExpression);
  }
};

const setIndentation = (text: string, column: number): string => {
  // first remove all leading whitespaces and then add the desired indentation
  return text
    .replace(/^\s*/gm, '')
    .replace(/^/gm, new Array(column).fill(' ').join(''))
    .replace(/^(\s*\*)/gm, ' $1');
};

const createDefaultValueAnnotation = (value: string): string => {
  const requiresFencing = value.match(/([{}<>`])/);
  if (requiresFencing) {
    return `
    /**
     * @defaultValue
     * \`\`\`
     * ${value}
     * \`\`\`
     */`;
  }
  return `/** @defaultValue ${value} */`;
};

const replaceComment = (
  fixer: RuleFixer,
  commentNode: TSESTree.Comment,
  tsDocComment: ParserContext
): RuleFix => {
  const column = commentNode.loc.start.column;
  // fix tsdoc output. See: https://github.com/microsoft/tsdoc/pull/427
  const stringBuilder = new StringBuilder();
  new TSDocEmitter().renderComment(stringBuilder, tsDocComment.docComment);
  const updatedValue = stringBuilder
    .toString()
    // remove trailing whitespaces
    .replace(/(.*?)\s*$/gm, '$1')
    .trimEnd();
  const [startRange, endRange] = commentNode.range;
  return fixer.replaceTextRange(
    [startRange - column, endRange],
    setIndentation(updatedValue, column)
  );
};

const createRule = ESLintUtils.RuleCreator(
  // TODO: Should be URL
  name => `${name}`
);

export default createRule({
  name: 'tsdoc-defaultValue-annotation',
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce correct @defaultValue TSDoc annotation'
    },
    schema: [] as const,
    fixable: 'code',
    messages: {
      incorrectDefaultValueAnnotation: 'Incorrect @defaultValue TSDoc annotation: {{ message }}',
      'error-missing-default-value': 'Missing @defaultValue TSDoc annotation on {{ property }}',
      'error-wrong-default-value':
        'Incorrect @defaultValue TSDoc annotation on {{ property }}. Expected: "{{ expected }}" / Actual: "{{ actual }}"',
      'error-loading-tsdoc-config-file': '{{ details }}',
      'error-applying-tsdoc-config': '{{ details }}'
    }
  },
  create: context => {
    const parser = getParser(context);
    return {
      'PropertyDefinition, MethodDefinition': (
        node: TSESTree.PropertyDefinition | TSESTree.MethodDefinition
      ) => {
        // TODO: This should be a part of the config instead
        if (context.filename.endsWith('.spec.ts') || context.filename.endsWith('.harness.ts')) {
          return;
        }
        if (node.accessibility === 'private' || node.accessibility === 'protected') {
          return;
        }
        if (node.type !== AST_NODE_TYPES.PropertyDefinition && node.kind !== 'set') {
          return undefined;
        }
        const parent = node.parent.parent;
        if (parent.type !== AST_NODE_TYPES.ClassDeclaration) {
          return undefined;
        }
        const comment = extractComment(node, context.sourceCode, parser);

        if (comment?.tsDocComment.docComment.modifierTagSet.isInternal()) {
          return;
        }

        const propertyInformation = extractPropertyInformation(node, context.sourceCode);
        if (propertyInformation.defaultValue) {
          if (!comment) {
            context.report({
              node,
              messageId: 'error-missing-default-value',
              data: { property: propertyInformation.propertyName },
              fix: fixer => {
                const newBlock = setIndentation(
                  createDefaultValueAnnotation(propertyInformation.defaultValue!),
                  node.loc.start.column
                ).replace(/^\s*/, '');

                return fixer.insertTextBefore(
                  node,
                  `${newBlock}\n${new Array(node.loc.start.column).fill(' ').join('')}`
                );
              }
            });
          } else if (!comment.defaultValue) {
            context.report({
              node: comment.commentNode,
              messageId: 'error-missing-default-value',
              data: { property: propertyInformation.propertyName },
              fix: fixer => {
                const newBlock = parser.parseString(
                  createDefaultValueAnnotation(propertyInformation.defaultValue!)
                ).docComment.customBlocks[0];
                comment.tsDocComment.docComment.appendCustomBlock(newBlock);
                return replaceComment(fixer, comment.commentNode, comment.tsDocComment);
              }
            });
          } else if (
            // a format independent comparison by removing all whitespaces and just checking if the doc-comment contains the default value
            !comment.defaultValue
              .replaceAll(/\s/g, '')
              .includes(propertyInformation.defaultValue.replaceAll(/\s/g, ''))
          ) {
            context.report({
              node: comment.commentNode,
              messageId: 'error-wrong-default-value',
              data: {
                property: propertyInformation.propertyName,
                expected: propertyInformation.defaultValue,
                actual: comment.defaultValue
              },
              fix: fixer => {
                const previousDefaultValue = comment.defaultValueTsDocNode!;
                previousDefaultValue.content.clearNodes();
                const newBlock = parser.parseString(
                  createDefaultValueAnnotation(propertyInformation.defaultValue!)
                ).docComment.customBlocks[0];
                previousDefaultValue.content.appendNodes(newBlock.content.getChildNodes());
                return replaceComment(fixer, comment.commentNode, comment.tsDocComment);
              }
            });
          }
        }
      }
    };
  }
});
