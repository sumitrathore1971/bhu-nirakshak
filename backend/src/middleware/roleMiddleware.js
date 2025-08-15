export function allowRoles(...allowed) {
  // Support both allowRoles('Citizen', 'Admin') and allowRoles(['Citizen', 'Admin'])
  const roles = Array.isArray(allowed[0]) ? allowed[0] : allowed;
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}
