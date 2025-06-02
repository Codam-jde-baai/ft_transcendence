import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';




export const newUserConnection = async (connection: { socket: WebSocket }, req: FastifyRequest) => {
    connection.socket.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        // Handle incoming messages from the user
        // You can parse the message and respond accordingly
        connection.socket.send(`Echo: ${message}`);
    });

    connection.socket.on('close', () => {
        console.log('Client disconnected');
    });
};
