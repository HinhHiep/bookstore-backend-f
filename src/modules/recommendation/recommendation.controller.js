import * as recService from "./recommendation.service.js";

export const getRecommendations = async (req, res, next) => {
  try {
    const books = await recService.getRecommendations(
      req.user._id
    );

    res.json({
      status: "success",
      data: books,
    });
  } catch (err) {
    next(err);
  }
};