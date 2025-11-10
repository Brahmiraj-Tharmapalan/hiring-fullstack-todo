import { connectDB as prismaConnect, disconnectDB as prismaDisconnect } from './prisma';

export async function connectDB() {
  await prismaConnect();
}

export async function disconnectDB() {
  await prismaDisconnect();
}
