import * as apiKeyService from "./api-keys.service.js";

export async function list(req, res, next) {
  try {
    const apiKeys = await apiKeyService.listApiKeys(req.user.id);
    res.status(200).json({ success: true, data: apiKeys });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const result = await apiKeyService.createApiKey(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: {
        apiKey: result.apiKey,
        key: result.key,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const apiKey = await apiKeyService.updateApiKey(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: apiKey });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await apiKeyService.deleteApiKey(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "API key deleted" });
  } catch (err) {
    next(err);
  }
}

export async function regenerate(req, res, next) {
  try {
    const result = await apiKeyService.regenerateApiKey(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: { apiKey: result.apiKey, key: result.key } });
  } catch (err) {
    next(err);
  }
}
