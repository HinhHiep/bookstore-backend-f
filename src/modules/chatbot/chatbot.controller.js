import * as chatbotService from "./chatbot.service.js";

export const chat = async (req, res, next) => {
  try {
    const result =
      await chatbotService.chatWithBot({
        userId: req.user?._id || null,

        chatId: req.body.chatId,

        message: req.body.message,
      });

    return res.json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};