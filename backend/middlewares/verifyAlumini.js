const verifyAlumni = (req, res, next) => {
    if (req.user.role !== "alumini") {
      return res.status(403).json({ message: "Access denied! Only alumni can post jobs." });
    }
    next();
  };
  module.exports = {verifyAlumni}
  