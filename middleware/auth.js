const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header("x-auth-token");

    // Check if not token
    // If not token, authorizaion denied
    if (!token) {
        return res.status(401).json({ msg: "No token, authorisation denied" });
    }
    // If there is a token, verify it by pulling out the payload and we're going to set the user,
    // that's in the payload to request stop user so that we will have access to this inside the route and then call next
    // If it does not verify then we're going to say token not valid
    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};