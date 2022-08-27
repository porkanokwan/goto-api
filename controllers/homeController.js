exports.home = async (req, res, next) => {
  try {
    res.status(200).json({ message: "Hi" });
  } catch (err) {
    next(err);
  }
};
