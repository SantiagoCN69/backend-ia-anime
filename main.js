document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Función para agregar un mensaje al chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = message;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Función para enviar el mensaje
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Agregar mensaje del usuario
        addMessage(message, true);
        userInput.value = '';

        try {
            const response = await fetch('https://backend-ia-anime.onrender.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el mensaje');
            }

            const aiResponse = data.response;
            if (!aiResponse) {
                throw new Error('Respuesta vacía de la API');
            }
            
            // Agregar respuesta del AI
            addMessage(aiResponse);
        } catch (error) {
            console.error('Error detallado:', error);
            addMessage(`Error: ${error.message || 'Error al comunicarse con el servidor. Por favor, intenta nuevamente.'}`);
        }
    }

    // Eventos
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
