const aiService = require("../services/ai.services");

module.exports.getResponse = async (req, res) => {
    const code= req.body.code;

    if (!code) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await aiService.getresponse(code);
        res.json({ review: response });
    } catch (error) {
        res.status(500).json({ error: "Failed to get AI response" });
    }
};
