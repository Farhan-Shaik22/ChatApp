import type { Core } from '@strapi/strapi';
import { env } from 'process';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

interface CustomSocket extends Socket  {
  user?: {
    id: number;
  };
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      let io = new Server(strapi.server.httpServer, {
        cors: {
          origin: ['http://localhost:3000', env.FRONTEND_URL],
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      io.use(async (socket : CustomSocket, next) => {
        try {
          const token = socket.handshake.auth.token?.split(' ')[1] || socket.handshake.headers.authorization?.split(' ')[1];
          
          if (!token) {
            return next(new Error('Authentication token missing'));
          }

          const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number };
          socket.user = {
            id: decoded.id,
          };
                    
          next();
        } catch (error) {
          console.error('Socket authentication error:', error);
          next(new Error('Authentication failed'));
        }
      });

      io.on('connection', (socket : CustomSocket) => {
        console.log(`User connected: Id: ${socket.user?.id}`);
        socket.on('sendMessage', async (message) => {
          try { 
            const savedMessage = await strapi.documents('api::message.message').create({
              data: {
                content: message.content,
                sender: message.sender,
                timestamp: new Date(),
              },
            });

            socket.emit('receiveMessage', savedMessage);
          } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('errorMessage', { error: 'Failed to save message' });
          }
        });

        socket.on('disconnect', () => {
          console.log('A user disconnected');
        });
      });
    } catch (error) {
      console.error('Error initializing Socket.IO:', error);
    }
  },
};
