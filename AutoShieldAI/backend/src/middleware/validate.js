function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const rule of schema) {
      const value = req.body?.[rule.field];
      const required = Boolean(rule.required);

      if (required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      if (rule.type === 'number' && Number.isNaN(Number(value))) {
        errors.push(`${rule.field} must be a number`);
        continue;
      }

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`);
        continue;
      }

      if (rule.allowed && !rule.allowed.includes(value)) {
        errors.push(`${rule.field} has invalid value`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ error: 'Invalid request payload', details: errors });
    }

    return next();
  };
}

module.exports = {
  validate
};