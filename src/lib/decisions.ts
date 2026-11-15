import type { FarmDecision, Round } from '../types'

interface DecisionOutcome {
  message: string
  sensible: boolean
}

export function getFarmDecisionOutcome(
  actualOutcome: Round['actual_outcome'],
  decision: FarmDecision,
): DecisionOutcome {
  if (actualOutcome === 'flood') {
    if (decision === 'harvest_early') {
      return {
        message: 'Harvesting early before a flood saves the crop.',
        sensible: true,
      }
    }
    if (decision === 'move_stored_produce') {
      return {
        message: 'Moving stored produce to higher ground protects it from floodwater.',
        sensible: true,
      }
    }
    return {
      message: 'Waiting during flood conditions puts the crop and stored produce at risk.',
      sensible: false,
    }
  }

  if (decision === 'wait_and_watch') {
    return {
      message: 'Waiting and watching avoids unnecessary work when no flood develops.',
      sensible: true,
    }
  }
  if (decision === 'harvest_early') {
    return {
      message: 'Harvesting early with no flood keeps some crop safe, but loses some yield.',
      sensible: false,
    }
  }
  return {
    message: 'Moving stored produce unnecessarily takes time and effort when there is no flood.',
    sensible: false,
  }
}
