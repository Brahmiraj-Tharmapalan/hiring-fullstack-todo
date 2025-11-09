import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});