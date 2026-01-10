import type { EventParticipant } from '@/types'
import { PARTICIPANT_STATUSES } from '@/types'

interface ParticipantListProps {
  participants: EventParticipant[]
  isOrganizer?: boolean
  onApprove?: (participantId: string) => void
  onReject?: (participantId: string) => void
  emptyMessage?: string
}

function getStatusColor(status: EventParticipant['status']): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    case 'cancelled':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }
}

export function ParticipantList({
  participants,
  isOrganizer = false,
  onApprove,
  onReject,
  emptyMessage = '参加者がいません',
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const statusLabel = PARTICIPANT_STATUSES.find((s) => s.value === participant.status)?.label || participant.status

        return (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {participant.photoURL ? (
                  <img
                    src={participant.photoURL}
                    alt={participant.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {participant.displayName}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(participant.status)}`}>
                    {statusLabel}
                  </span>
                  {participant.message && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                      {participant.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for organizer */}
            {isOrganizer && participant.status === 'pending' && (
              <div className="flex items-center gap-2">
                {onApprove && (
                  <button
                    onClick={() => onApprove(participant.id)}
                    className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    承認
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={() => onReject(participant.id)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    拒否
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
