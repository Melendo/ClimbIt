import { validationResult } from 'express-validator';

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
