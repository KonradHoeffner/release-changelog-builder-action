import * as core from '@actions/core'
import {Extractor, Property, Regex, RegexTransformer, Transformer} from './types'

export function validateTransformer(transformer?: Regex): RegexTransformer | null {
  if (transformer === undefined) {
    return null
  }
  try {
    let target = undefined
    if (transformer.hasOwnProperty('target')) {
      target = (transformer as Transformer).target
    }

    let onProperty = undefined
    let method = undefined
    let onEmpty = undefined
    if (transformer.hasOwnProperty('method')) {
      method = (transformer as Extractor).method
      onEmpty = (transformer as Extractor).on_empty
      onProperty = (transformer as Extractor).on_property
    } else if (transformer.hasOwnProperty('on_property')) {
      onProperty = (transformer as Extractor).on_property
    }
    // legacy handling, transform single value input to array
    if (!Array.isArray(onProperty)) {
      if (onProperty !== undefined) {
        onProperty = [onProperty]
      }
    }

    return buildRegex(transformer, target, onProperty, method, onEmpty)
  } catch (e) {
    core.warning(`⚠️ Failed to validate transformer: ${transformer.pattern}`)
    return null
  }
}

/**
 * Constructs the RegExp, providing the configured Regex and additional values
 */
export function buildRegex(
  regex: Regex,
  target: string | undefined,
  onProperty?: Property[] | undefined,
  method?: 'replace' | 'match' | undefined,
  onEmpty?: string | undefined
): RegexTransformer | null {
  try {
    return {
      pattern: new RegExp(regex.pattern.replace('\\\\', '\\'), regex.flags ?? 'gu'),
      target: target || '',
      onProperty,
      method,
      onEmpty
    }
  } catch (e) {
    core.warning(`⚠️ Bad regex: ${regex.pattern} (${e})`)
    return null
  }
}
