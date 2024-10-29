import { generateText } from "../lib/gemini.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/errorHandler.js";
import { redis } from "../app.js";

const TTL = 3600;

type ChatType = {
  sessionId: string;
  messages: { message: string; response: string }[];
};

const chatController = TryCatch(async (req, res, next) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!sessionId || !message)
    return next(new ErrorHandler(400, "Please provide sessionId and message"));

  // Find the session ID
  const chatSessionRaw = await redis.get(sessionId);
  let chatSession: ChatType | null = chatSessionRaw
    ? JSON.parse(chatSessionRaw)
    : null;

  // Check if the message is already cached
  const cachedResponse = await redis.get(`message:${message}`);

  // If the session ID does not exist, create a new session ID
  if (!chatSession) {
    let response = "";
    if (cachedResponse) response = cachedResponse;
    else {
      response = await generateText(message);
      await redis.setex(`message:${message}`, TTL, response);
    }

    chatSession = {
      sessionId,
      messages: [{ message, response }],
    };

    await redis.setex(sessionId, TTL, JSON.stringify(chatSession));
  } else {
    let response = "";
    if (cachedResponse) response = cachedResponse;
    else {
      const previousAllConversion = chatSession.messages
        .map((msg) => `I ask ${msg.message} - you replied ${msg.response} `)
        .join(" ");

      // If the session ID exists, push the message and response
      response = await generateText(
        `this is the previous conversation ${previousAllConversion}, so now ${message}`
      );
      await redis.setex(`message:${message}`, TTL, response);
    }

    chatSession.messages.push({ message, response });
    await redis.setex(sessionId, TTL, JSON.stringify(chatSession));
  }

  return res.status(200).json({
    success: true,
    messages: chatSession.messages,
  });
});

export { chatController };
