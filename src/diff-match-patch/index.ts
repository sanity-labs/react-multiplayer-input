// Diff
export {cleanupEfficiency, cleanupSemantic} from './diff/cleanup'
export {
  type Diff,
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT,
  type DiffOptions,
  type DiffType,
  diff as makeDiff,
} from './diff/diff'

// Match
export {match} from './match/match'

// Patch
export {apply as applyPatches, type ApplyPatchOptions, type PatchResult} from './patch/apply'
export {type Patch} from './patch/createPatchObject'
export {make as makePatches, type MakePatchOptions} from './patch/make'
export {parse as parsePatch} from './patch/parse'
export {stringifyPatch, stringify as stringifyPatches} from './patch/stringify'

// UCS-2 utils (beta)
export {adjustIndiciesToUcs2, type AdjustmentOptions} from './utils/utf8Indices'

// other utils
export {xIndex} from './diff/xIndex'
export {bitap} from './match/bitap'
