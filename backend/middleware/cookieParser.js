const cookieParser = () => (req, res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach((cookie) => {
      const parts = cookie.trim().split('=');
      const key = parts[0];
      const val = parts.slice(1).join('=');
      if (key) {
        req.cookies[key] = decodeURIComponent(val);
      }
    });
  }
  next();
};

export default cookieParser;
