import 'dotenv/config';
import amqplib, { type ChannelModel, type Channel } from 'amqplib';

export const QUEUE_CHARGES = 'charges.process';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqplib.connect(process.env.RABBITMQ_URL ?? 'amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_CHARGES, { durable: true });
  channel.prefetch(1);

  return channel;
}

export async function closeQueue(): Promise<void> {
  await channel?.close();
  await connection?.close();
  channel = null;
  connection = null;
}
