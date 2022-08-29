exports.home = async (req, res, next) => {
  try {
    // GET All Place
    res.status(200).json({ message: "Hi" });
  } catch (err) {
    next(err);
  }
};
