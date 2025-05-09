import { codeBlockSchema } from '@milkdown/kit/preset/commonmark'
import { nodeRule } from '@milkdown/kit/prose'
import { textblockTypeInputRule } from '@milkdown/kit/prose/inputrules'
import { $inputRule } from '@milkdown/kit/utils'

import { mathInlineSchema } from './inline-latex'

/// Input rule for inline math.
/// When you type $E=MC^2$, it will create an inline math node.
export const mathInlineInputRule = $inputRule((ctx) =>
  nodeRule(/(?:\$)([^$]+)(?:\$)$/, mathInlineSchema.type(ctx), {
    getAttr: (match) => {
      return {
        value: match[1] ?? '',
      }
    },
  })
)

/// A input rule for creating block math.
/// For example, `$$ ` will create a code block with language javascript.
export const mathBlockInputRule = $inputRule((ctx) =>
  textblockTypeInputRule(/^\$\$[\s\n]$/, codeBlockSchema.type(ctx), () => ({
    language: 'LaTeX',
  }))
)
