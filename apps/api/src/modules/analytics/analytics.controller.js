import * as analyticsService from "./analytics.service.js";

export async function index(req, res, next) {
  try {
    const data = await analyticsService.getAnalytics(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
