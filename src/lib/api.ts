export const LYZR_API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

export async function sendChatMessage(message: string) {
  const response = await fetch('https://agent.api.lyzr.app/v2/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LYZR_API_KEY
    },
    body: JSON.stringify({
      user_id: "shreyas.kapale@gmail.com",
      agent_id: "",
      session_id: "fecc63b7-1d72-4c8c-866f-ad553181f585",
      message: message
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send message to Lyzr API');
  }

  return response.json();
}