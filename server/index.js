const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const URI =
  "mongodb+srv://root:root@cluster0.sy2sv0c.mongodb.net/?appName=Cluster0";
const DB = "interview_intelligence";
let db;

MongoClient.connect(URI)
  .then((client) => {
    db = client.db(DB);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// GET all questions (with filters)
app.get("/api/questions", async (req, res) => {
  const { status, is_covered, how_covered, language, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter["gpt_analysis.coverage_status"] = status;
  if (is_covered) filter["gpt_analysis.is_covered"] = is_covered;
  if (how_covered) filter["gpt_analysis.how_covered"] = how_covered;
  if (language) filter["gpt_analysis.language"] = language;
  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [
      { Question: regex },
      { "Company Name": regex },
      { "gpt_analysis.justification": regex },
      { "gpt_analysis.matched_topics": regex },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [questions, total] = await Promise.all([
    db
      .collection("questions")
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray(),
    db.collection("questions").countDocuments(filter),
  ]);

  res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET single question
app.get("/api/questions/:id", async (req, res) => {
  const question = await db
    .collection("questions")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!question) return res.status(404).json({ error: "Not found" });
  res.json(question);
});

// GET summary stats (all three dimensions)
app.get("/api/stats", async (req, res) => {
  const [isCovered, howCovered, coverageStatus, languages] = await Promise.all([
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.is_covered", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.how_covered", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.coverage_status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.language", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
  ]);

  const pythonNotCovered = await db.collection("questions").countDocuments({
    "gpt_analysis.is_covered": "NOT_COVERED",
    "gpt_analysis.language": "Python",
  });

  const total = isCovered.reduce((s, x) => s + x.count, 0);
  const pythonTotal = await db.collection("questions").countDocuments({ "gpt_analysis.language": "Python" });
  res.json({ is_covered: isCovered, how_covered: howCovered, coverage_status: coverageStatus, languages, total, python_not_covered: pythonNotCovered, python_total: pythonTotal });
});

// POST remark for a question
app.post("/api/questions/:id/remarks", async (req, res) => {
  const { name, remark, action, session } = req.body;
  if (!name || !remark)
    return res.status(400).json({ error: "name and remark required" });

  const doc = {
    question_id: new ObjectId(req.params.id),
    name,
    remark,
    created_at: new Date(),
  };
  if (action) doc.action = action;
  if (session) doc.session = session;
  await db.collection("remarks").insertOne(doc);

  res.json({ success: true, remark: doc });
});

// GET remarks for a question
app.get("/api/questions/:id/remarks", async (req, res) => {
  const remarks = await db
    .collection("remarks")
    .find({ question_id: new ObjectId(req.params.id) })
    .sort({ created_at: -1 })
    .toArray();
  res.json(remarks);
});

// GET all remarks (for remarks page)
app.get("/api/remarks", async (req, res) => {
  const { name, action, session } = req.query;
  const matchStage = {};
  if (name) matchStage.name = name;
  if (action) matchStage.action = action;
  if (session) matchStage.session = session;

  const pipeline = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    { $sort: { created_at: -1 } },
    {
      $lookup: {
        from: "questions",
        localField: "question_id",
        foreignField: "_id",
        as: "question",
      },
    },
    { $unwind: { path: "$question", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        remark: 1,
        action: 1,
        session: 1,
        created_at: 1,
        "question._id": 1,
        "question.Question": 1,
        "question.Company Name": 1,
        "question.Round Category": 1,
        "question.gpt_analysis.coverage_status": 1,
        "question.gpt_analysis.is_covered": 1,
        "question.gpt_analysis.how_covered": 1,
        "question.gpt_analysis.language": 1,
        "question.gpt_analysis.similarity_percentage": 1,
        "question.gpt_analysis.justification": 1,
        "question.gpt_analysis.matches": 1,
      },
    },
  ];
  const remarks = await db
    .collection("remarks")
    .aggregate(pipeline)
    .toArray();
  res.json(remarks);
});

// ─── Reviewers ───
app.get("/api/reviewers", async (req, res) => {
  const reviewers = await db.collection("reviewers").find().sort({ email: 1 }).toArray();
  res.json(reviewers);
});

app.post("/api/reviewers", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.endsWith("@nxtwave.co.in"))
    return res.status(400).json({ error: "Valid @nxtwave.co.in email required" });
  const existing = await db.collection("reviewers").findOne({ email });
  if (!existing) {
    await db.collection("reviewers").insertOne({ email, created_at: new Date() });
  }
  res.json({ success: true, email });
});

// ─── Update question fields (with change tracking) ───
app.put("/api/questions/:id", async (req, res) => {
  const { fields, changed_by } = req.body;
  if (!fields || !changed_by)
    return res.status(400).json({ error: "fields and changed_by required" });

  const question = await db.collection("questions").findOne({ _id: new ObjectId(req.params.id) });
  if (!question) return res.status(404).json({ error: "Not found" });

  const updates = {};
  const historyEntries = [];

  for (const [field, newValue] of Object.entries(fields)) {
    const oldValue = question.gpt_analysis?.[field];
    if (oldValue !== newValue) {
      updates[`gpt_analysis.${field}`] = newValue;
      historyEntries.push({
        question_id: new ObjectId(req.params.id),
        field,
        old_value: oldValue || null,
        new_value: newValue,
        changed_by,
        changed_at: new Date(),
      });
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.collection("questions").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );
    if (historyEntries.length > 0) {
      await db.collection("change_history").insertMany(historyEntries);
    }
  }

  const updated = await db.collection("questions").findOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true, question: updated });
});

// ─── Change history for a question ───
app.get("/api/questions/:id/history", async (req, res) => {
  const history = await db.collection("change_history")
    .find({ question_id: new ObjectId(req.params.id) })
    .sort({ changed_at: -1 })
    .toArray();
  res.json(history);
});

// ─── Review questions ───
app.post("/api/questions/:id/review", async (req, res) => {
  const { reviewer_email, status } = req.body;
  if (!reviewer_email) return res.status(400).json({ error: "reviewer_email required" });

  await db.collection("reviews").updateOne(
    { question_id: new ObjectId(req.params.id), reviewer_email },
    {
      $set: {
        question_id: new ObjectId(req.params.id),
        reviewer_email,
        status: status || "reviewed",
        reviewed_at: new Date(),
      },
    },
    { upsert: true }
  );
  res.json({ success: true });
});

// ─── Get review status for questions (by reviewer) ───
app.get("/api/reviews", async (req, res) => {
  const { reviewer_email } = req.query;
  const filter = {};
  if (reviewer_email) filter.reviewer_email = reviewer_email;
  const reviews = await db.collection("reviews").find(filter).toArray();
  res.json(reviews);
});

// ─── Get questions for review (pending for a reviewer) ───
app.get("/api/review-questions", async (req, res) => {
  const { reviewer_email, status: reviewStatus, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let reviewedIds = [];
  if (reviewer_email && reviewStatus === "pending") {
    const reviewed = await db.collection("reviews")
      .find({ reviewer_email, status: "reviewed" })
      .toArray();
    reviewedIds = reviewed.map((r) => r.question_id);
  }

  const filter = {};
  if (reviewedIds.length > 0 && reviewStatus === "pending") {
    filter._id = { $nin: reviewedIds };
  } else if (reviewer_email && reviewStatus === "reviewed") {
    const reviewed = await db.collection("reviews")
      .find({ reviewer_email, status: "reviewed" })
      .toArray();
    const ids = reviewed.map((r) => r.question_id);
    if (ids.length === 0) return res.json({ questions: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
    filter._id = { $in: ids };
  }

  const [questions, total] = await Promise.all([
    db.collection("questions").find(filter).skip(skip).limit(parseInt(limit)).toArray(),
    db.collection("questions").countDocuments(filter),
  ]);

  res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
});

// Serve React client build
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = 4000;
