function participantJoined(userName, joinTime) {}

export default function webhookReceived(data) {
  if (data.event === 'meeting.participant_joined') {
    const { participant } = data.payload.object;
    participantJoined(participant.user_name, participant.join_time);
  }
}
