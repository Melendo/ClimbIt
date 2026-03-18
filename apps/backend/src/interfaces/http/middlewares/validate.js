import fs from 'fs/promises';
import { validationResult } from 'express-validator';

async function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        if (unlinkError.code !== 'ENOENT') {
          return res.status(500).json({ error: unlinkError.message });
        }
      }
    }

    return res.status(422).json({
      status: 'invalid_request',
      errors: errors.array({ onlyFirstError: true }).map((e) => ({
        field: e.path,
        msg: e.msg,
        value: e.value,
        location: e.location,
      })),
    });
  }
  next();
}

export default validate;
