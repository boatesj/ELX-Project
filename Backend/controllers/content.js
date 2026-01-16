const ContentBlock = require("../models/ContentBlock");

// -------- CONTENT: LIST (admin) --------
exports.getContentBlocks = async (req, res) => {
  try {
    const blocks = await ContentBlock.find().sort({ key: 1 });
    res.status(200).json(blocks);
  } catch (err) {
    console.error("getContentBlocks error:", err);
    res.status(500).json({ message: "Failed to fetch content blocks" });
  }
};

// -------- CONTENT: GET BY KEY (public) --------
exports.getContentBlockByKey = async (req, res) => {
  try {
    const key = String(req.params.key || "")
      .trim()
      .toLowerCase();
    const block = await ContentBlock.findOne({ key });

    if (!block) {
      return res.status(404).json({ message: "Content block not found" });
    }

    res.status(200).json(block);
  } catch (err) {
    console.error("getContentBlockByKey error:", err);
    res.status(500).json({ message: "Failed to fetch content block" });
  }
};

// -------- CONTENT: CREATE (admin) --------
exports.createContentBlock = async (req, res) => {
  try {
    const item = await ContentBlock.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error("createContentBlock error:", err);
    res
      .status(400)
      .json({ message: "Failed to create content block", error: err.message });
  }
};

// -------- CONTENT: UPDATE BY KEY (admin) --------
exports.updateContentBlockByKey = async (req, res) => {
  try {
    const key = String(req.params.key || "")
      .trim()
      .toLowerCase();

    const item = await ContentBlock.findOneAndUpdate({ key }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Content block not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("updateContentBlockByKey error:", err);
    res
      .status(400)
      .json({ message: "Failed to update content block", error: err.message });
  }
};

// -------- CONTENT: DELETE BY KEY (admin) --------
exports.deleteContentBlockByKey = async (req, res) => {
  try {
    const key = String(req.params.key || "")
      .trim()
      .toLowerCase();

    const item = await ContentBlock.findOneAndDelete({ key });

    if (!item) {
      return res.status(404).json({ message: "Content block not found" });
    }

    res.status(200).json({ message: "Content block deleted" });
  } catch (err) {
    console.error("deleteContentBlockByKey error:", err);
    res
      .status(400)
      .json({ message: "Failed to delete content block", error: err.message });
  }
};
