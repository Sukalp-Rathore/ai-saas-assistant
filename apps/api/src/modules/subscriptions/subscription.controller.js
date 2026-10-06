import * as subscriptionService from "./subscription.service.js";

export async function index(req, res, next) {
  try {
    const data = await subscriptionService.getSubscription(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function upgrade(req, res, next) {
  try {
    const { planId } = req.body;
    const data = await subscriptionService.upgradePlan(req.user.id, planId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
