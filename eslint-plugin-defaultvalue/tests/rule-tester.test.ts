/**
 * Copyright Siemens 2024.
 * SPDX-License-Identifier: MIT
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import defaultValueRule from '../lib/rules/default-value';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts*']
      },
      tsconfigRootDir: '.'
    }
  }
});

ruleTester.run('tsdoc-defaultValue-annotation', defaultValueRule, {
  valid: [
    {
      code: `
import { input, model } from '@angular/core';

class Test {
  /**
   * @defaultValue 'initValue'
   */
  propS = "initValue";

  /**
   * @defaultValue 0
   */
  propN = 0;

  /**
   * @defaultValue -1
   */
  propUN = -1;

  /**
   * @defaultValue \\{ key: "value" \\}
   */
  propO = { key: "value" };

  /**
   * @defaultValue [ 0, 1 ]
   */
  propA = [ 0, 1 ];

  /**
   * @defaultValue 0
   */
  readonly propSignal = signal(0);
  /**
   * @defaultValue
   * \`\`\`
   * tag\`content-within\`
   * \`\`\`
   */
  propWithTaggedTemplate = tag\`content-within\`;

  /**
   * @defaultValue my custom value
   */
  get propG() { return 0; }
  private propPrivate = 'private';
  protected propProtected = 'protected';
  /** @internal */
  internal = 'internal';

  private tempFunc: () => any = () => {};
  private tempFuncObj = { sub: tempFunc } as const;

  readonly dontDefaultValueMe = 42;
  readonly dontDefaultValueThisCall = this.temp();
  readonly dontDefaultValueThisMemberCall = this.sub.temp();
  signalValue = input.required<number>();
  modelValue = model<string>();
}
`
    }
  ],
  invalid: [
    {
      code: `
class Test {
  propWithoutDoc = 'initValue';
  /**
   * Doc without defaultValue.
   * And with a second line.
   * And a third line linking {@link propWithoutDoc} to test.
   *
   * @deprecated My deprecation
   */
  propWithDoc = signal(0);
  /**
   * @defaultValue
   * \`\`\`
   * () => a - b
   * \`\`\`
   */
  propWithWrongDefaultValue = () => a + b;
  propWithTaggedTemplate = tag\`content-within{{evil}}\`;
  inputProp = input('test');
}
`,
      errors: [
        {
          messageId: 'error-missing-default-value',
          data: { property: 'propWithoutDoc' }
        },
        {
          messageId: 'error-missing-default-value',
          data: { property: 'propWithDoc' }
        },
        {
          messageId: 'error-wrong-default-value',
          data: {
            property: 'propWithWrongDefaultValue',
            actual: '() => a - b',
            expected: '() => a + b'
          }
        },
        {
          messageId: 'error-missing-default-value',
          data: { property: 'propWithTaggedTemplate' }
        },
        {
          messageId: 'error-missing-default-value',
          data: { property: 'inputProp' }
        }
      ],
      output: `
class Test {
  /** @defaultValue 'initValue' */
  propWithoutDoc = 'initValue';
  /**
   * Doc without defaultValue.
   * And with a second line.
   * And a third line linking {@link propWithoutDoc} to test.
   *
   * @deprecated My deprecation
   *
   * @defaultValue 0
   */
  propWithDoc = signal(0);
  /**
   * @defaultValue
   * \`\`\`
   * () => a + b
   * \`\`\`
   */
  propWithWrongDefaultValue = () => a + b;
  /**
   * @defaultValue
   * \`\`\`
   * tag\`content-within{{evil}}\`
   * \`\`\`
   */
  propWithTaggedTemplate = tag\`content-within{{evil}}\`;
  /** @defaultValue 'test' */
  inputProp = input('test');
}
`
    }
  ]
});
