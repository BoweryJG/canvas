/**
 * WebSocket Handler Example for Agent Server
 * This shows how to integrate NPI lookup into the WebSocket server
 * 
 * Note: This is an example implementation since the actual agent server
 * appears to be hosted separately. Use this as a guide for your server implementation.
 */

const { Server } = require('socket.io');
const { 
  detectDoctorMentions, 
  lookupDoctorNPI, 
  findBestMatch,
  generateDoctorSalesContext 
} = require('./doctorDetection'); // You'll need to port the TS functions to JS
const { buildSystemPrompt, processMessageForInsights } = require('./agentCore'); // Port from TS

class AgentWebSocketHandler {
  constructor(httpServer, options = {}) {
    this.io = new Server(httpServer, {
      path: '/agents-ws',
      cors: options.cors || {
        origin: ['https://canvas.repspheres.com', 'http://localhost:5173'],
        credentials: true
      }
    });

    this.conversations = new Map(); // Store conversation contexts
    this.setupHandlers();
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Agent WebSocket connected:', socket.id);

      // Authenticate user
      socket.on('authenticate', async (data) => {
        try {
          const user = await this.verifyToken(data.token);
          socket.userId = user.id;
          socket.join(`user:${user.id}`);
          socket.emit('authenticated', { success: true });
        } catch (error) {
          socket.emit('error', { message: 'Authentication failed' });
          socket.disconnect();
        }
      });

      // Handle new conversation
      socket.on('conversation:new', (data) => {
        const conversationId = data.conversationId;
        this.conversations.set(conversationId, {
          agentId: data.agentId,
          doctors: new Map(),
          context: {}
        });
        socket.join(`conversation:${conversationId}`);
      });

      // Handle conversation loading
      socket.on('conversation:load', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
      });

      // Handle messages with doctor detection
      socket.on('message', async (data) => {
        const { conversationId, message, agentId, metadata } = data;
        const conversation = this.conversations.get(conversationId) || { doctors: new Map() };

        try {
          // Detect doctors in the message
          const mentions = await this.detectAndLookupDoctors(message);
          
          // Store detected doctors in conversation context
          mentions.forEach(({ doctor, mention }) => {
            if (doctor) {
              conversation.doctors.set(doctor.displayName, doctor);
              
              // Emit doctor detection event
              socket.emit('doctor:detected', {
                conversationId,
                mention,
                doctor
              });
            }
          });

          // Build system prompt with doctor context
          const systemPrompt = buildSystemPrompt({
            agentName: 'Sales AI Assistant', // Get from agent data
            agentSpecialty: ['Medical Device Sales', 'Aesthetic Procedures'],
            personality: {
              tone: 'professional',
              traits: ['knowledgeable', 'helpful', 'strategic'],
              expertise: ['sales', 'medical devices', 'relationship building'],
              communication_style: 'consultative'
            },
            doctors: Array.from(conversation.doctors.values()),
            procedure: metadata?.procedure
          });

          // Generate AI response
          const aiResponse = await this.generateAIResponse(systemPrompt, message, conversation);

          // Process response for insights
          const insights = processMessageForInsights(
            message, 
            Array.from(conversation.doctors.values())
          );

          // Stream response
          await this.streamResponse(socket, conversationId, aiResponse, {
            doctors: Array.from(conversation.doctors.values()),
            insights
          });

          // Emit insights if any
          if (insights.length > 0) {
            socket.emit('agent:insights', {
              conversationId,
              insights
            });
          }

        } catch (error) {
          console.error('Message handling error:', error);
          socket.emit('error', { 
            conversationId, 
            message: 'Failed to process message' 
          });
        }
      });

      // Handle doctor lookup requests
      socket.on('doctor:lookup', async (data) => {
        const { conversationId, doctorName } = data;
        
        try {
          const results = await this.lookupDoctor(doctorName);
          
          if (results.doctor) {
            // Store in conversation context
            const conversation = this.conversations.get(conversationId);
            if (conversation) {
              conversation.doctors.set(results.doctor.displayName, results.doctor);
            }

            socket.emit('doctor:info', {
              conversationId,
              doctor: results.doctor,
              salesContext: generateDoctorSalesContext(results.doctor)
            });
          }
        } catch (error) {
          console.error('Doctor lookup error:', error);
        }
      });

      // Handle context updates
      socket.on('conversation:updateContext', (data) => {
        const { conversationId, context } = data;
        const conversation = this.conversations.get(conversationId);
        
        if (conversation) {
          Object.assign(conversation.context, context);
          
          if (context.doctor) {
            conversation.doctors.set(context.doctor.displayName, context.doctor);
          }
        }
      });

      // Clean up on disconnect
      socket.on('disconnect', () => {
        console.log('Agent WebSocket disconnected:', socket.id);
      });
    });
  }

  async detectAndLookupDoctors(text) {
    const mentions = detectDoctorMentions(text);
    const results = [];

    for (const mention of mentions) {
      if (mention.confidence > 0.6) {
        try {
          const npiResults = await lookupDoctorNPI(
            mention.firstName, 
            mention.lastName
          );
          const bestMatch = findBestMatch(mention, npiResults);
          
          results.push({
            mention,
            doctor: bestMatch,
            npiResults
          });
        } catch (error) {
          console.error('Doctor lookup failed:', error);
          results.push({ mention, doctor: null });
        }
      }
    }

    return results;
  }

  async lookupDoctor(doctorName) {
    const parts = doctorName.split(' ');
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    try {
      const npiResults = await lookupDoctorNPI(firstName, lastName);
      const bestMatch = npiResults.length > 0 ? npiResults[0] : null;
      
      return {
        doctor: bestMatch,
        alternatives: npiResults.slice(1, 5)
      };
    } catch (error) {
      console.error('Doctor lookup error:', error);
      return { doctor: null, alternatives: [] };
    }
  }

  async generateAIResponse(systemPrompt, userMessage, conversation) {
    // This would integrate with your AI service (OpenAI, Claude, etc.)
    // Example implementation:
    try {
      const response = await fetch('YOUR_AI_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          stream: true
        })
      });

      return response;
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }

  async streamResponse(socket, conversationId, response, metadata) {
    // Stream the response chunks
    let fullResponse = '';
    
    // Simulate streaming (replace with actual streaming implementation)
    const chunks = response.split(' ');
    for (const chunk of chunks) {
      fullResponse += chunk + ' ';
      
      socket.emit('agent:message:chunk', {
        conversationId,
        chunk: chunk + ' '
      });
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Emit completion
    socket.emit('agent:message:complete', {
      conversationId,
      messageId: Date.now().toString(),
      content: fullResponse.trim(),
      metadata
    });
  }

  async verifyToken(token) {
    // Implement your token verification logic
    // This should validate the JWT and return user info
    return { id: 'user123', email: 'user@example.com' };
  }
}

// Export for use in your server
module.exports = AgentWebSocketHandler;

// Example usage in your server:
/*
const express = require('express');
const http = require('http');
const AgentWebSocketHandler = require('./websocket-handlers');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket handler
const wsHandler = new AgentWebSocketHandler(server, {
  cors: {
    origin: ['https://canvas.repspheres.com', 'http://localhost:5173'],
    credentials: true
  }
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
*/